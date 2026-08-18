"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Loader2, CircleHelp, Save, X,
  ChevronRight, Globe, Layers, ListFilter, Layout,
  Settings, Info, Shield, CheckCircle, CircleHelp as FaqIcon,
  Search, ExternalLink, Image as ImageIcon, Upload,
  Check, MoveUp, MoveDown, Home, Building2, Building,
  Droplets, ShieldCheck, Clock, Award, Users, TrendingUp,
  BadgeCheck, Star, Zap, Sparkles, Palette, Sun, Snowflake,
  Trophy, Hammer, Truck, ClipboardCheck, FileText, ArrowRight,
  Wrench, HardHat, Ruler, Paintbrush, Wind, Flame, Thermometer,
  Copy, Shovel, Fence, Drill, Square, Box, Construction, PenTool as Tool,
  MapPin, Phone, Mail, DollarSign, Target, Briefcase, Cpu, Monitor, Megaphone
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SeoEditor from "@/components/admin/SeoEditor";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
  ssr: false,
  loading: () => <div className="h-48 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Editor...</div>
});

const ICON_LIST = Array.from(new Set([
  "Search", "Monitor", "Megaphone", "MousePointerClick", "Palette", "PenTool",
  "ShoppingCart", "BarChart2", "CheckCircle2", "Globe", "MapPin", "Star",
  "Trophy", "ShieldCheck", "Award", "DollarSign", "Briefcase", "Cpu",
  "TrendingUp", "Building2", "Target", "Terminal", "Zap", "HeartHandshake",
  "Shield", "Layers", "Home", "Droplet", "Clock", "Layout", "Users", "Sparkles"
]));

const IconComponentMap: Record<string, any> = LucideIcons;

function IconSelector({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const SelectedIcon = IconComponentMap[value] || CircleHelp;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1 text-[13px] hover:border-[#2271b1] transition-all"
      >
        <SelectedIcon className="w-3.5 h-3.5 text-[#50575e]" />
        <span>{value || "Select Icon"}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-[#c3c4c7] shadow-md p-3 rounded-[3px]">
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
            {ICON_LIST.map((iconName) => {
              const IconComp = IconComponentMap[iconName];
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={`p-1.5 rounded hover:bg-[#f0f0f1] ${value === iconName ? "bg-[#2271b1] text-white" : "text-[#50575e]"}`}
                  title={iconName}
                >
                  {IconComp ? (
                    <IconComp className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border border-dashed rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_SERVICE_TEMPLATE = {
  title: "",
  slug: "",
  tag: "Premium Solution",
  icon: "Search",
  status: "published",
  hero: {
    titleIntro: "Transform Your Business With",
    titleHighlight: "Expert Solutions",
    description: "High-performance digital engineering and growth architecture tailored to maximize brand equity.",
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
    ]
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
    outcomeText: "Guaranteed Outcome",
    list: [
      { metric: "350%", title: "Organic Visibility", desc: "Accelerating discovery on top search engines through clean structured code.", outcomeText: "Guaranteed Outcome" },
      { metric: "4.8x", title: "Conversion Yield", desc: "Frictionless UX funnels designed specifically to capture and convert leads.", outcomeText: "Guaranteed Outcome" },
      { metric: "99.9%", title: "Reliability & Uptime", desc: "Enterprise infrastructure built on modern serverless edge architecture.", outcomeText: "Guaranteed Outcome" },
      { metric: "<1s", title: "Load Performance", desc: "Lightning fast asset delivery boosting Core Web Vitals and SEO rankings.", outcomeText: "Guaranteed Outcome" }
    ]
  },
  process: {
    eyebrow: "06 // IMPLEMENTATION ROADMAP",
    titleIntro: "Our Step-by-Step",
    titleHighlight: "Roadmap",
    description: "We orchestrate campaigns sequentially, guaranteeing structured code deliverables and auditable checkpoints at each stage of your roadmap.",
    calloutTag: "// PROCESS COMPLIANCE",
    calloutText: "Every milestone is cataloged in the shared workspace, providing real-time deployment logs and verification reports.",
    steps: [
      {
        title: "Discovery & Technical Diagnostics",
        desc: "Full audit of your digital ecosystem, tech stack, and user funnels.",
        phaseTag: "PHASE 01 // CAMPAIGN",
        deliverables: ["Google Search Console crawl diagnostics log", "Competitor backlinks overlapping index", "Core Web Vitals loading bottleneck check"],
        footerLeft: "Verification Checkpoint",
        footerRight: "Verified Node"
      },
      {
        title: "Architecture & Wireframing",
        desc: "Structuring high-converting user flows and component hierarchies.",
        phaseTag: "PHASE 02 // CAMPAIGN",
        deliverables: ["Commercial search priority map authoring", "Intent-based topic structure planning", "Semantic keyword clusters setup"],
        footerLeft: "Verification Checkpoint",
        footerRight: "Verified Node"
      },
      {
        title: "Production Build & Optimization",
        desc: "Clean development with modern frameworks and strict performance standards.",
        phaseTag: "PHASE 03 // CAMPAIGN",
        deliverables: ["H1-H4 headings structures rewrite rules", "Title & Meta description tags optimizations", "JSON-LD schema structured data injection"],
        footerLeft: "Verification Checkpoint",
        footerRight: "Verified Node"
      },
      {
        title: "Verification & Quality Assurance",
        desc: "Multi-device cross-browser testing and performance stress audits.",
        phaseTag: "PHASE 04 // CAMPAIGN",
        deliverables: ["Render-blocking scripts async tags setup", "Vercel edge CDN cache configuration", "Image formats (WebP/AVIF) audit fixes"],
        footerLeft: "Verification Checkpoint",
        footerRight: "Verified Node"
      },
      {
        title: "Deployment & Attribution Sync",
        desc: "Live rollout with custom event telemetry and analytics tracking.",
        phaseTag: "PHASE 05 // CAMPAIGN",
        deliverables: ["High-authority editorial mentions pitches", "Niche local citation indexes registry", "Toxic backlink removal & disavow log"],
        footerLeft: "Verification Checkpoint",
        footerRight: "Verified Node"
      },
      {
        title: "Iterative Growth & Scaling",
        desc: "Continuous improvements driven by verified performance data.",
        phaseTag: "PHASE 06 // CAMPAIGN",
        deliverables: ["Custom GA4 key event tracking logs", "Attributed phone calls & forms tracking", "Bi-weekly Looker Studio conversion audit"],
        footerLeft: "Verification Checkpoint",
        footerRight: "Verified Node"
      }
    ]
  },
  results: {
    eyebrow: "07 // PROVEN PERFORMANCE",
    titleIntro: "Real-World",
    titleHighlight: "Impact & ROI",
    caseStudies: [
      {
        title: "Enterprise Brand Growth",
        challenge: "Outdated legacy site experiencing slow load speeds and declining conversions.",
        strategy: "Engineered headless architecture with streamlined conversion pathways.",
        outcome: "+240% Qualified Inbound Inquiries"
      },
      {
        title: "Commercial Multi-Location Reach",
        challenge: "Fragmented map listings and poor regional organic rankings.",
        strategy: "Deployed localized landing architecture and high-authority citation schema.",
        outcome: "+410% Map Pack Actions"
      }
    ],
    metrics: [
      { value: "450%", label: "TRAFFIC GROWTH", desc: "Average organic session boost across 12-month engagements." },
      { value: "3.8x", label: "ROI MULTIPLIER", desc: "Documented revenue acceleration from attributed funnels." },
      { value: "99%", label: "CLIENT RETENTION", desc: "Long-term client partnerships built on consistent delivery." },
      { value: "24/7", label: "SUPPORT SYNC", desc: "Continuous uptime and real-time response capability." }
    ]
  },
  industries: {
    eyebrow: "08 // SECTORS WE ACCELERATE",
    titleIntro: "Industries",
    titleHighlight: "We Specialize In",
    list: [
      { title: "Home Services & Contracting", desc: "Roofing, decking, remodeling, and local trade contractors scaling regional territories." },
      { title: "Technology & SaaS", desc: "Fast-growth software startups and tech firms demanding high conversion rates." },
      { title: "Commercial Real Estate", desc: "Property developers, architectural firms, and luxury real estate agencies." },
      { title: "E-Commerce & Retail", desc: "Direct-to-consumer and B2B brands scaling transactions with seamless checkout." },
      { title: "Professional Services", desc: "Law firms, financial consultancies, and executive agencies building trust." },
      { title: "Healthcare & Wellness", desc: "Clinics, medical practices, and private health facilities seeking patient acquisition." }
    ]
  },
  tools: {
    eyebrow: "09 // TECH STACK",
    titleIntro: "Modern",
    titleHighlight: "Frameworks & Tools",
    list: [
      { name: "Next.js", iconName: "Monitor" },
      { name: "React.js", iconName: "Cpu" },
      { name: "Tailwind CSS", iconName: "Palette" },
      { name: "Google Analytics 4", iconName: "BarChart2" },
      { name: "Google Search", iconName: "Search" },
      { name: "Vercel", iconName: "Globe" }
    ]
  },
  whyChooseUs: {
    eyebrow: "10 // OUR ADVANTAGE",
    titleIntro: "Why Leaders Choose",
    titleHighlight: "Mohsin Designs",
    stats: [
      { value: "100%", label: "PERFORMANCE", sublabel: "Next.js Headless\\nSpeed Optimization", percentage: 1.0 },
      { value: "4.5x", label: "AVERAGE ROI", sublabel: "Attributed Leads\\nGrowth Scaling", percentage: 0.9 },
      { value: "24/7", label: "DATA SYNC", sublabel: "Live Tracking\\nReal-time Reports", percentage: 0.85 }
    ],
    list: [
      { title: "Engineered For Speed & ROI", desc: "We write clean, high-performance code with zero bloated themes or brittle templates." },
      { title: "Direct Strategic Communication", desc: "No junior middlemen — work directly with senior architects dedicated to your vision." },
      { title: "Transparent Telemetry & Ownership", desc: "Full ownership of your code, design assets, and marketing data at every step." },
      { title: "Compounding Growth Systems", desc: "Solutions designed to build continuous momentum that outperforms competitors over time." }
    ]
  },
  pricing: {
    eyebrow: "11 // TRANSPARENT TIERS",
    titleIntro: "Scalable Growth",
    titleHighlight: "Investment Packages",
    plans: [
      {
        name: "Sprint Tier",
        desc: "Targeted execution for focused optimization and rapid turnaround.",
        price: "$2,450",
        period: "sprint",
        isPopular: false,
        isCustom: false,
        ctaText: "Select Sprint",
        features: ["Full Technical Diagnostic", "Core Feature Implementation", "Speed & Security Hardening", "2 Weeks Dedicated Support"]
      },
      {
        name: "Growth Tier",
        desc: "Complete comprehensive solution built to dominate competitive markets.",
        price: "$4,850",
        period: "project",
        isPopular: true,
        isCustom: false,
        ctaText: "Start Growth Plan",
        features: ["End-to-End Custom Build", "Conversion Rate Optimization", "Custom Analytics & Tracking", "SEO & Speed Maxima", "30 Days Hypercare Support"]
      },
      {
        name: "Enterprise Tier",
        desc: "Custom architected multi-location and enterprise-grade infrastructure.",
        price: "Custom",
        period: "custom scope",
        isPopular: false,
        isCustom: true,
        ctaText: "Request Scope",
        features: ["Unlimited Dynamic Architecture", "Headless CMS Integration", "Dedicated Lead Engineering", "Priority SLA & SLA Support"]
      }
    ]
  },
  faqs: [
    { q: "How quickly can we get started?", a: "We typically onboard new projects within 3-5 business days following the initial strategy discovery call." },
    { q: "Do you offer ongoing support and updates?", a: "Yes, we provide flexible retainer and maintenance support options to ensure your platform remains fast, secure, and continuously optimized." },
    { q: "Will I have complete ownership of all assets?", a: "100%. You retain full ownership of all code, design files, domains, and analytics accounts upon project completion." }
  ],
  finalCta: {
    eyebrow: "READY TO ACCELERATE?",
    titleIntro: "Let's Build Your Next",
    titleHighlight: "Competitive Edge",
    titleLine2: "Together.",
    description: "Schedule a free strategic consultation. We'll audit your existing presence and map out a concrete blueprint for scalable growth."
  }
};

export default function ServicesAdminPage() {
  const [data, setData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("hero");
  const [seo, setSeo] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  const [form, setForm] = useState<any>(DEFAULT_SERVICE_TEMPLATE);

  useEffect(() => {
    fetch("/api/content").then(res => res.json()).then(json => {
      setData(json);
      const list = Array.isArray(json.services?.services) && json.services.services.length > 0
        ? json.services.services
        : (Array.isArray(json.services) && json.services.length > 0
            ? json.services
            : (Array.isArray(json.globalServices) && json.globalServices.length > 0
                ? json.globalServices
                : (Array.isArray(json.services?.list) && json.services.list.length > 0 ? json.services.list : [])));
      setServices(list);
    });
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
        setToast({ type: "ok", msg: "Service updated successfully." });
        setTimeout(() => setToast(null), 3000);
        if (keepEditingIdx !== undefined) {
          setIsEditing(keepEditingIdx);
          if (updatedForm) {
            setForm(updatedForm);
          }
        } else {
          setIsEditing(null);
        }
      } else {
        setToast({ type: "err", msg: "Failed to save." });
      }
    } catch {
      setToast({ type: "err", msg: "Failed to save." });
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
      faqs: service.faqs || service.faq || DEFAULT_SERVICE_TEMPLATE.faqs,
      finalCta: {
        ...DEFAULT_SERVICE_TEMPLATE.finalCta,
        ...(service.finalCta || {})
      }
    });
    setSeo(service.seo || {});
    setIsEditing(originalIdx !== -1 ? originalIdx : 0);
    setActiveTab("hero");
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

  const handleDelete = (index: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const newServices = services.filter((_, i) => i !== index);
    saveToDb(newServices);
    if (isEditing === index) setIsEditing(null);
  };

  const handleAddNew = () => {
    setForm(DEFAULT_SERVICE_TEMPLATE);
    setSeo({});
    setIsEditing(services.length);
    setActiveTab("hero");
  };

  const publishedCount = services.filter((s: any) => s.status !== 'draft').length;
  const draftCount = services.filter((s: any) => s.status === 'draft').length;

  const filteredServices = services.filter((s: any) => {
    const matchesFilter = filter === 'all' || (filter === 'published' ? s.status !== 'draft' : s.status === 'draft');
    const matchesSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.slug?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabs = [
    { id: "hero", label: "General & Hero" },
    { id: "trust", label: "Client Trust" },
    { id: "what-included", label: "What's Included" },
    { id: "strategy", label: "Strategy" },
    { id: "benefits", label: "Benefits" },
    { id: "process", label: "Process Roadmap" },
    { id: "results", label: "Results & Cases" },
    { id: "industries", label: "Industries" },
    { id: "tools", label: "Tools & Tech" },
    { id: "why-us", label: "Why Choose Us" },
    { id: "pricing", label: "Pricing Plans" },
    { id: "final-cta", label: "Final CTA" },
    { id: "faq", label: "FAQs" },
    { id: "seo", label: "SEO" }
  ];

  return (
    <div className="wrap max-w-7xl mx-auto p-4 sm:p-6 text-[#1d2327] font-sans">
      
      {/* WordPress Page Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-[23px] font-normal leading-tight text-[#1d2327]">
          {isEditing !== null ? "Edit Service" : "Services"}
        </h1>
        {isEditing === null && (
          <button
            onClick={handleAddNew}
            className="border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white px-2.5 py-0.5 rounded-[3px] text-[13px] font-medium transition-all"
          >
            Add New
          </button>
        )}
      </div>

      {toast && (
        <div className={`notice px-3 py-2 border-l-4 text-[13px] bg-white shadow-sm mb-4 ${toast.type === 'ok' ? 'border-[#00a32a]' : 'border-[#d63638]'}`}>
          <p>{toast.msg}</p>
        </div>
      )}

      {isEditing !== null ? (
        /* WordPress Classic Edit Post View */
        <div className="space-y-4">
          <div className="flex items-center gap-1 text-[13px] text-[#2271b1] mb-2">
            <button onClick={() => setIsEditing(null)} className="hover:underline">← All Services</button>
            <ChevronRight className="w-3.5 h-3.5 text-[#646970] shrink-0" />
            <span className="text-[#646970]">{form.title || "New Service"}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Left Column (#post-body-content) */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Title input */}
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-[#8c8f94] bg-white px-3 py-2 text-[18px] font-medium rounded-[3px] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none"
                placeholder="Enter title here"
              />

              {/* Permalink Bar */}
              <div className="text-[13px] text-[#646970] flex items-center gap-1.5 flex-wrap bg-[#f6f7f7] border border-[#c3c4c7] p-2 rounded-[3px]">
                <strong className="text-[#1d2327]">Permalink:</strong>
                <span className="text-[#646970]">https://mohsindesigns.com/services/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="border border-[#8c8f94] px-1.5 py-0.5 rounded-[2px] text-xs font-mono bg-white text-[#2271b1] font-bold"
                />
                <Link
                  href={`/services/${form.slug}`}
                  target="_blank"
                  className="border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white px-2 py-0.5 rounded-[3px] text-[11px] font-semibold ml-auto flex items-center gap-1"
                >
                  View Service <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* WP Tabbed Metabox */}
              <div className="postbox bg-white border border-[#c3c4c7] shadow-sm rounded-[3px] overflow-hidden">
                
                {/* Horizontal WP Tabs */}
                <div className="flex flex-wrap border-b border-[#c3c4c7] bg-[#f6f7f7]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 text-[13px] font-medium border-r border-[#c3c4c7] transition-all ${
                        activeTab === tab.id
                          ? "bg-white text-[#1d2327] font-bold border-b-2 border-b-[#2271b1] -mb-[1px]"
                          : "text-[#2271b1] hover:bg-[#f0f0f1]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-5 space-y-5 min-h-[420px]">

                  {/* TAB 01: HERO */}
                  {activeTab === "hero" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Category Tag</label>
                          <input
                            type="text"
                            value={form.tag || ""}
                            onChange={(e) => setForm({ ...form, tag: e.target.value })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                            placeholder="e.g. Premium Solution"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Menu Icon</label>
                          <div><IconSelector value={form.icon || "Search"} onChange={(v) => setForm({ ...form, icon: v })} /></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Hero Title Intro</label>
                          <input
                            type="text"
                            value={form.hero?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, hero: { ...form.hero, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                            placeholder="Transform Your Business With"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Hero Title Highlight</label>
                          <input
                            type="text"
                            value={form.hero?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, hero: { ...form.hero, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                            placeholder="Expert Solutions"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-[#1d2327]">Hero Description</label>
                        <textarea
                          rows={3}
                          value={form.hero?.description || ""}
                          onChange={(e) => setForm({ ...form, hero: { ...form.hero, description: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                        />
                      </div>

                      {/* Hero Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#c3c4c7]">
                        <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                          <h4 className="font-bold text-xs text-[#1d2327]">Primary Button (Yellow)</h4>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-[#646970]">Label</label>
                            <input
                              type="text"
                              value={form.hero?.primaryCta?.text || ""}
                              onChange={(e) => setForm({
                                ...form,
                                hero: {
                                  ...form.hero,
                                  primaryCta: { ...form.hero?.primaryCta, text: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              placeholder="Start Your Project"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-[#646970]">Link / Anchor</label>
                            <input
                              type="text"
                              value={form.hero?.primaryCta?.link || ""}
                              onChange={(e) => setForm({
                                ...form,
                                hero: {
                                  ...form.hero,
                                  primaryCta: { ...form.hero?.primaryCta, link: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              placeholder="#contact-form"
                            />
                          </div>
                        </div>

                        <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                          <h4 className="font-bold text-xs text-[#1d2327]">Secondary Button (White Outline)</h4>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-[#646970]">Label</label>
                            <input
                              type="text"
                              value={form.hero?.secondaryCta?.text || ""}
                              onChange={(e) => setForm({
                                ...form,
                                hero: {
                                  ...form.hero,
                                  secondaryCta: { ...form.hero?.secondaryCta, text: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              placeholder="Explore Inclusions"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-[#646970]">Link / Anchor</label>
                            <input
                              type="text"
                              value={form.hero?.secondaryCta?.link || ""}
                              onChange={(e) => setForm({
                                ...form,
                                hero: {
                                  ...form.hero,
                                  secondaryCta: { ...form.hero?.secondaryCta, link: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              placeholder="#what-included"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-bold text-[#1d2327]">Hero Key Benefits Checklist</label>
                          <button
                            type="button"
                            onClick={() => {
                              const b = [...(form.hero?.benefits || [])];
                              b.push("New verified advantage");
                              setForm({ ...form, hero: { ...form.hero, benefits: b } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Benefit
                          </button>
                        </div>
                        {(form.hero?.benefits || []).map((ben: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ben}
                              onChange={(e) => {
                                const b = [...form.hero.benefits];
                                b[idx] = e.target.value;
                                setForm({ ...form, hero: { ...form.hero, benefits: b } });
                              }}
                              className="flex-1 border border-[#8c8f94] px-3 py-1 text-[13px] rounded-[3px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const b = form.hero.benefits.filter((_: any, i: number) => i !== idx);
                                setForm({ ...form, hero: { ...form.hero, benefits: b } });
                              }}
                              className="text-[#d63638] hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 02: TRUST */}
                  {activeTab === "trust" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-[#1d2327]">Marquee Heading</label>
                        <input
                          type="text"
                          value={form.clientTrust?.heading || ""}
                          onChange={(e) => setForm({ ...form, clientTrust: { ...form.clientTrust, heading: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                        />
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-bold text-[#1d2327]">Platform Logos & Icons in Marquee</label>
                          <button
                            type="button"
                            onClick={() => {
                              const l = [...(form.clientTrust?.logos || [])];
                              l.push({ name: "Platform Name", icon: "Search", image: "" });
                              setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Platform Logo
                          </button>
                        </div>
                        {(form.clientTrust?.logos || []).map((logo: any, idx: number) => (
                          <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1d2327]">Logo Item 0{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const l = form.clientTrust.logos.filter((_: any, i: number) => i !== idx);
                                  setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                }}
                                className="text-[#d63638] text-xs font-bold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-[#646970]">Platform / Brand Name</label>
                                <input
                                  type="text"
                                  value={logo.name}
                                  onChange={(e) => {
                                    const l = [...form.clientTrust.logos];
                                    l[idx] = { ...l[idx], name: e.target.value };
                                    setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                  }}
                                  className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                                  placeholder="e.g. Google Ads, Shopify"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-[#646970]">Icon</label>
                                <div>
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
                            </div>
                            <div className="space-y-1 pt-1">
                              <ImageField
                                label="Custom Logo Image (Replaces icon if uploaded)"
                                value={logo.image || ""}
                                onChange={(url) => {
                                  const l = [...form.clientTrust.logos];
                                  l[idx] = { ...l[idx], image: url };
                                  setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 03: WHAT'S INCLUDED */}
                  {activeTab === "what-included" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.whatIncluded?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, whatIncluded: { ...form.whatIncluded, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.whatIncluded?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, whatIncluded: { ...form.whatIncluded, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.whatIncluded?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, whatIncluded: { ...form.whatIncluded, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Core Pillars (3 Cards)</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const p = [...(form.whatIncluded?.pillars || [])];
                              p.push({ title: "New Pillar", desc: "Pillar description", features: ["Feature 1", "Feature 2"] });
                              setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Pillar
                          </button>
                        </div>

                        {(form.whatIncluded?.pillars || []).map((pillar: any, idx: number) => (
                          <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                            <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-1.5">
                              <span className="font-bold text-xs text-[#1d2327]">Pillar 0{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const p = form.whatIncluded.pillars.filter((_: any, i: number) => i !== idx);
                                  setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                                }}
                                className="text-[#d63638] text-xs font-bold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Pillar Title"
                              value={pillar.title}
                              onChange={(e) => {
                                const p = [...form.whatIncluded.pillars];
                                p[idx] = { ...p[idx], title: e.target.value };
                                setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                            />
                            <textarea
                              rows={2}
                              placeholder="Description"
                              value={pillar.desc}
                              onChange={(e) => {
                                const p = [...form.whatIncluded.pillars];
                                p[idx] = { ...p[idx], desc: e.target.value };
                                setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            />
                            <input
                              type="text"
                              placeholder="Features (comma separated)"
                              value={(pillar.features || []).join(", ")}
                              onChange={(e) => {
                                const p = [...form.whatIncluded.pillars];
                                p[idx] = { ...p[idx], features: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) };
                                setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 04: STRATEGY */}
                  {activeTab === "strategy" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.strategy?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.strategy?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.strategy?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-[#1d2327]">Strategy Section Description</label>
                        <textarea
                          rows={2}
                          value={form.strategy?.description || ""}
                          onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, description: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          placeholder="A custom implementation plan targeting bottlenecks and compounding acquisition flows."
                        />
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Strategy Components</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const c = [...(form.strategy?.components || [])];
                              c.push({ num: `0${c.length + 1}`, title: "New Component", desc: "Details here" });
                              setForm({ ...form, strategy: { ...form.strategy, components: c } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Component
                          </button>
                        </div>

                        {(form.strategy?.components || []).map((comp: any, idx: number) => (
                          <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="01"
                                value={comp.num}
                                onChange={(e) => {
                                  const c = [...form.strategy.components];
                                  c[idx] = { ...c[idx], num: e.target.value };
                                  setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                }}
                                className="w-14 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <input
                                type="text"
                                placeholder="Component Title"
                                value={comp.title}
                                onChange={(e) => {
                                  const c = [...form.strategy.components];
                                  c[idx] = { ...c[idx], title: e.target.value };
                                  setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                }}
                                className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const c = form.strategy.components.filter((_: any, i: number) => i !== idx);
                                  setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                }}
                                className="text-[#d63638] p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Description"
                              value={comp.desc}
                              onChange={(e) => {
                                const c = [...form.strategy.components];
                                c[idx] = { ...c[idx], desc: e.target.value };
                                setForm({ ...form, strategy: { ...form.strategy, components: c } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 05: BENEFITS */}
                  {activeTab === "benefits" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.benefits?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.benefits?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.benefits?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Benefits with Animated Numbers</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const l = [...(form.benefits?.list || [])];
                              l.push({ metric: "100%", title: "New Benefit", desc: "Benefit description", outcomeText: "Guaranteed Outcome" });
                              setForm({ ...form, benefits: { ...form.benefits, list: l } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Metric Benefit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(form.benefits?.list || []).map((b: any, idx: number) => (
                            <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#1d2327]">Benefit 0{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const l = form.benefits.list.filter((_: any, i: number) => i !== idx);
                                    setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                  }}
                                  className="text-[#d63638] text-xs font-bold hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="Metric (350%)"
                                  value={b.metric}
                                  onChange={(e) => {
                                    const l = [...form.benefits.list];
                                    l[idx] = { ...l[idx], metric: e.target.value };
                                    setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                  }}
                                  className="col-span-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold text-[#2271b1]"
                                />
                                <input
                                  type="text"
                                  placeholder="Title"
                                  value={b.title}
                                  onChange={(e) => {
                                    const l = [...form.benefits.list];
                                    l[idx] = { ...l[idx], title: e.target.value };
                                    setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                  }}
                                  className="col-span-2 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                                />
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Description"
                                value={b.desc}
                                onChange={(e) => {
                                  const l = [...form.benefits.list];
                                  l[idx] = { ...l[idx], desc: e.target.value };
                                  setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                }}
                                className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <input
                                type="text"
                                placeholder="Outcome Badge Label (e.g. Guaranteed Outcome)"
                                value={b.outcomeText || ""}
                                onChange={(e) => {
                                  const l = [...form.benefits.list];
                                  l[idx] = { ...l[idx], outcomeText: e.target.value };
                                  setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                }}
                                className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-semibold text-[#2271b1]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 06: PROCESS */}
                  {activeTab === "process" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.process?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, process: { ...form.process, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.process?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, process: { ...form.process, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.process?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, process: { ...form.process, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-[#1d2327]">Process Section Description</label>
                        <textarea
                          rows={2}
                          value={form.process?.description || ""}
                          onChange={(e) => setForm({ ...form, process: { ...form.process, description: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                        />
                      </div>

                      {/* Process Callout Box Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px]">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#1d2327]">Callout Eyebrow / Tag</label>
                          <input
                            type="text"
                            value={form.process?.calloutTag || ""}
                            onChange={(e) => setForm({ ...form, process: { ...form.process, calloutTag: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            placeholder="// PROCESS COMPLIANCE"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#1d2327]">Callout Text</label>
                          <textarea
                            rows={2}
                            value={form.process?.calloutText || ""}
                            onChange={(e) => setForm({ ...form, process: { ...form.process, calloutText: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            placeholder="Every milestone is cataloged in the shared workspace..."
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Roadmap Steps & Deliverables</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const s = [...(form.process?.steps || [])];
                              s.push({
                                title: "New Phase",
                                desc: "Phase description",
                                phaseTag: `PHASE 0${s.length + 1} // CAMPAIGN`,
                                deliverables: ["Deliverable 1", "Deliverable 2"],
                                footerLeft: "Verification Checkpoint",
                                footerRight: "Verified Node"
                              });
                              setForm({ ...form, process: { ...form.process, steps: s } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Phase
                          </button>
                        </div>

                        {(form.process?.steps || []).map((step: any, idx: number) => (
                          <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1d2327]">Phase 0{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const s = form.process.steps.filter((_: any, i: number) => i !== idx);
                                  setForm({ ...form, process: { ...form.process, steps: s } });
                                }}
                                className="text-[#d63638] text-xs font-bold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Phase Title"
                                value={step.title}
                                onChange={(e) => {
                                  const s = [...form.process.steps];
                                  s[idx] = { ...s[idx], title: e.target.value };
                                  setForm({ ...form, process: { ...form.process, steps: s } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                              />
                              <input
                                type="text"
                                placeholder="Phase Badge Tag (e.g. PHASE 01 // CAMPAIGN)"
                                value={step.phaseTag || ""}
                                onChange={(e) => {
                                  const s = [...form.process.steps];
                                  s[idx] = { ...s[idx], phaseTag: e.target.value };
                                  setForm({ ...form, process: { ...form.process, steps: s } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold text-[#2271b1]"
                              />
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Phase Description"
                              value={step.desc}
                              onChange={(e) => {
                                const s = [...form.process.steps];
                                s[idx] = { ...s[idx], desc: e.target.value };
                                setForm({ ...form, process: { ...form.process, steps: s } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            />
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-[#646970]">Deliverables Checklist (Comma separated)</label>
                              <input
                                type="text"
                                value={(step.deliverables || []).join(", ")}
                                onChange={(e) => {
                                  const s = [...form.process.steps];
                                  s[idx] = { ...s[idx], deliverables: e.target.value.split(",").map((item: string) => item.trim()).filter(Boolean) };
                                  setForm({ ...form, process: { ...form.process, steps: s } });
                                }}
                                className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                                placeholder="Google Search Console audit, Core Web Vitals check, Schema injection"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 07: RESULTS */}
                  {activeTab === "results" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.results?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, results: { ...form.results, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.results?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, results: { ...form.results, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.results?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, results: { ...form.results, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Section Description</label>
                          <input
                            type="text"
                            value={form.results?.description || ""}
                            onChange={(e) => setForm({ ...form, results: { ...form.results, description: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                            placeholder="Verifiable metric indicators driven by precise performance scaling..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Featured Case Studies Eyebrow</label>
                          <input
                            type="text"
                            value={form.results?.caseStudiesEyebrow || ""}
                            onChange={(e) => setForm({ ...form, results: { ...form.results, caseStudiesEyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                            placeholder="Featured Case Studies"
                          />
                        </div>
                      </div>

                      {/* Case Studies */}
                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Case Studies (Interactive Carousel)</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const cs = [...(form.results?.caseStudies || [])];
                              cs.push({ title: "New Case Study", challenge: "Challenge overview", strategy: "Strategy used", outcome: "+200% Inquiries", outcomeLabel: "Campaign Outcome" });
                              setForm({ ...form, results: { ...form.results, caseStudies: cs } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Case Study
                          </button>
                        </div>

                        {(form.results?.caseStudies || []).map((cs: any, idx: number) => (
                          <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1d2327]">Case Study 0{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const c = form.results.caseStudies.filter((_: any, i: number) => i !== idx);
                                  setForm({ ...form, results: { ...form.results, caseStudies: c } });
                                }}
                                className="text-[#d63638] text-xs font-bold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Title"
                                value={cs.title}
                                onChange={(e) => {
                                  const c = [...form.results.caseStudies];
                                  c[idx] = { ...c[idx], title: e.target.value };
                                  setForm({ ...form, results: { ...form.results, caseStudies: c } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                              />
                              <input
                                type="text"
                                placeholder="Outcome Label (Campaign Outcome)"
                                value={cs.outcomeLabel || ""}
                                onChange={(e) => {
                                  const c = [...form.results.caseStudies];
                                  c[idx] = { ...c[idx], outcomeLabel: e.target.value };
                                  setForm({ ...form, results: { ...form.results, caseStudies: c } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <input
                                type="text"
                                placeholder="Outcome Value (+240% Leads)"
                                value={cs.outcome}
                                onChange={(e) => {
                                  const c = [...form.results.caseStudies];
                                  c[idx] = { ...c[idx], outcome: e.target.value };
                                  setForm({ ...form, results: { ...form.results, caseStudies: c } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold text-[#2271b1]"
                              />
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Challenge & Strategy"
                              value={cs.challenge}
                              onChange={(e) => {
                                const c = [...form.results.caseStudies];
                                c[idx] = { ...c[idx], challenge: e.target.value };
                                setForm({ ...form, results: { ...form.results, caseStudies: c } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Result Metrics */}
                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <h4 className="font-bold text-[13px] text-[#1d2327]">Result Metrics (4 Grid Counters)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {(form.results?.metrics || []).map((m: any, idx: number) => (
                            <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2 rounded-[3px] space-y-1">
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="Tag (M01)"
                                  value={m.tag || ""}
                                  onChange={(e) => {
                                    const metrics = [...form.results.metrics];
                                    metrics[idx] = { ...metrics[idx], tag: e.target.value };
                                    setForm({ ...form, results: { ...form.results, metrics } });
                                  }}
                                  className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono"
                                />
                                <input
                                  type="text"
                                  placeholder="Value (450%)"
                                  value={m.value}
                                  onChange={(e) => {
                                    const metrics = [...form.results.metrics];
                                    metrics[idx] = { ...metrics[idx], value: e.target.value };
                                    setForm({ ...form, results: { ...form.results, metrics } });
                                  }}
                                  className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold text-[#2271b1]"
                                />
                                <input
                                  type="text"
                                  placeholder="Label"
                                  value={m.label}
                                  onChange={(e) => {
                                    const metrics = [...form.results.metrics];
                                    metrics[idx] = { ...metrics[idx], label: e.target.value };
                                    setForm({ ...form, results: { ...form.results, metrics } });
                                  }}
                                  className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold uppercase"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Description"
                                value={m.desc}
                                onChange={(e) => {
                                  const metrics = [...form.results.metrics];
                                  metrics[idx] = { ...metrics[idx], desc: e.target.value };
                                  setForm({ ...form, results: { ...form.results, metrics } });
                                }}
                                className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 08: INDUSTRIES */}
                  {activeTab === "industries" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.industries?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, industries: { ...form.industries, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.industries?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, industries: { ...form.industries, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.industries?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, industries: { ...form.industries, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Card Footer Left Label</label>
                          <input
                            type="text"
                            value={form.industries?.footerLeft || ""}
                            onChange={(e) => setForm({ ...form, industries: { ...form.industries, footerLeft: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                            placeholder="Target Sector"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Card Footer Right Label</label>
                          <input
                            type="text"
                            value={form.industries?.footerRight || ""}
                            onChange={(e) => setForm({ ...form, industries: { ...form.industries, footerRight: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                            placeholder="Verified Optimization"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Target Sectors</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const ind = [...(form.industries?.list || [])];
                              ind.push({ title: "New Industry", desc: "Industry description", watermark: "IN" });
                              setForm({ ...form, industries: { ...form.industries, list: ind } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Sector
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(form.industries?.list || []).map((item: any, idx: number) => (
                            <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  placeholder="Industry Title"
                                  value={item.title}
                                  onChange={(e) => {
                                    const ind = [...form.industries.list];
                                    ind[idx] = { ...ind[idx], title: e.target.value };
                                    setForm({ ...form, industries: { ...form.industries, list: ind } });
                                  }}
                                  className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                                />
                                <input
                                  type="text"
                                  placeholder="Watermark (HS)"
                                  value={item.watermark || ""}
                                  onChange={(e) => {
                                    const ind = [...form.industries.list];
                                    ind[idx] = { ...ind[idx], watermark: e.target.value };
                                    setForm({ ...form, industries: { ...form.industries, list: ind } });
                                  }}
                                  className="w-20 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-center"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const ind = form.industries.list.filter((_: any, i: number) => i !== idx);
                                    setForm({ ...form, industries: { ...form.industries, list: ind } });
                                  }}
                                  className="text-[#d63638] p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Description"
                                value={item.desc}
                                onChange={(e) => {
                                  const ind = [...form.industries.list];
                                  ind[idx] = { ...ind[idx], desc: e.target.value };
                                  setForm({ ...form, industries: { ...form.industries, list: ind } });
                                }}
                                className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 09: TOOLS */}
                  {activeTab === "tools" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.tools?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, tools: { ...form.tools, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.tools?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, tools: { ...form.tools, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.tools?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, tools: { ...form.tools, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-[#1d2327]">Section Description</label>
                        <textarea
                          rows={2}
                          value={form.tools?.description || ""}
                          onChange={(e) => setForm({ ...form, tools: { ...form.tools, description: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          placeholder="High-performance frameworks and analytics systems driving client ROI metrics."
                        />
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Tools & Frameworks</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const t = [...(form.tools?.list || [])];
                              t.push({ name: "Tool Name", iconName: "Monitor", tag: "CAMPAIGN", desc: "Tool configuration description" });
                              setForm({ ...form, tools: { ...form.tools, list: t } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Tool
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(form.tools?.list || []).map((tool: any, idx: number) => (
                            <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#1d2327]">Tool 0{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const t = form.tools.list.filter((_: any, i: number) => i !== idx);
                                    setForm({ ...form, tools: { ...form.tools, list: t } });
                                  }}
                                  className="text-[#d63638] text-xs font-bold hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Name"
                                  value={tool.name}
                                  onChange={(e) => {
                                    const t = [...form.tools.list];
                                    t[idx] = { ...t[idx], name: e.target.value };
                                    setForm({ ...form, tools: { ...form.tools, list: t } });
                                  }}
                                  className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                                />
                                <input
                                  type="text"
                                  placeholder="Tag (CORE DEV)"
                                  value={tool.tag || ""}
                                  onChange={(e) => {
                                    const t = [...form.tools.list];
                                    t[idx] = { ...t[idx], tag: e.target.value };
                                    setForm({ ...form, tools: { ...form.tools, list: t } });
                                  }}
                                  className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono uppercase"
                                />
                              </div>
                              <div>
                                <IconSelector
                                  value={tool.iconName || "Monitor"}
                                  onChange={(v) => {
                                    const t = [...form.tools.list];
                                    t[idx] = { ...t[idx], iconName: v };
                                    setForm({ ...form, tools: { ...form.tools, list: t } });
                                  }}
                                />
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Description"
                                value={tool.desc || tool.description || ""}
                                onChange={(e) => {
                                  const t = [...form.tools.list];
                                  t[idx] = { ...t[idx], desc: e.target.value, description: e.target.value };
                                  setForm({ ...form, tools: { ...form.tools, list: t } });
                                }}
                                className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 10: WHY CHOOSE US */}
                  {activeTab === "why-us" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.whyChooseUs?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.whyChooseUs?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.whyChooseUs?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-[#1d2327]">Section Description</label>
                        <textarea
                          rows={2}
                          value={form.whyChooseUs?.description || ""}
                          onChange={(e) => setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, description: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          placeholder="We design fully custom solutions engineered around revenue metrics..."
                        />
                      </div>

                      {/* 3 Circular Stat Rings */}
                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <h4 className="font-bold text-[13px] text-[#1d2327]">3 Circular Stat Rings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(() => {
                            const defaultStats = [
                              { value: "100%", label: "PERFORMANCE", sublabel: "Next.js Headless\nSpeed Optimization", percentage: 1.0 },
                              { value: "4.5x", label: "AVERAGE ROI", sublabel: "Attributed Leads\nGrowth Scaling", percentage: 0.9 },
                              { value: "24/7", label: "DATA SYNC", sublabel: "Live Tracking\nReal-time Reports", percentage: 0.85 }
                            ];
                            const existingStats = form.whyChooseUs?.stats || [];
                            // Always show 3 rings; use saved value or fall back to default for missing slots
                            return [0, 1, 2].map(i => existingStats[i] || defaultStats[i]);
                          })().map((stat: any, idx: number) => (
                            <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-1.5">
                              <span className="font-bold text-xs text-[#2271b1]">Ring 0{idx + 1}</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Value (100%)"
                                  value={stat.value || ""}
                                  onChange={(e) => {
                                    const stats = [...(form.whyChooseUs?.stats || [])];
                                    stats[idx] = { ...stats[idx], value: e.target.value };
                                    setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, stats } });
                                  }}
                                  className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold text-[#2271b1]"
                                />
                                <input
                                  type="text"
                                  placeholder="Label (PERFORMANCE)"
                                  value={stat.label || ""}
                                  onChange={(e) => {
                                    const stats = [...(form.whyChooseUs?.stats || [])];
                                    stats[idx] = { ...stats[idx], label: e.target.value };
                                    setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, stats } });
                                  }}
                                  className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold uppercase"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Sublabel (use \n for line break)"
                                value={stat.sublabel || ""}
                                onChange={(e) => {
                                  const stats = [...(form.whyChooseUs?.stats || [])];
                                  stats[idx] = { ...stats[idx], sublabel: e.target.value };
                                  setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, stats } });
                                }}
                                className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Differentiators</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(form.whyChooseUs?.list || [])];
                              list.push({ title: "New Differentiator", desc: "Detailed explanation", tag: `Differentiator 0${list.length + 1}` });
                              setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, list } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Differentiator
                          </button>
                        </div>

                        {(form.whyChooseUs?.list || []).map((item: any, idx: number) => (
                          <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1d2327]">Differentiator 0{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = form.whyChooseUs.list.filter((_: any, i: number) => i !== idx);
                                  setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, list } });
                                }}
                                className="text-[#d63638] text-xs font-bold hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Tag (Differentiator 01)"
                                value={item.tag || ""}
                                onChange={(e) => {
                                  const list = [...form.whyChooseUs.list];
                                  list[idx] = { ...list[idx], tag: e.target.value };
                                  setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, list } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[#2271b1]"
                              />
                              <input
                                type="text"
                                placeholder="Title"
                                value={item.title}
                                onChange={(e) => {
                                  const list = [...form.whyChooseUs.list];
                                  list[idx] = { ...list[idx], title: e.target.value };
                                  setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, list } });
                                }}
                                className="col-span-2 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                              />
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Description"
                              value={item.desc}
                              onChange={(e) => {
                                const list = [...form.whyChooseUs.list];
                                list[idx] = { ...list[idx], desc: e.target.value };
                                setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, list } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 11: PRICING */}
                  {activeTab === "pricing" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.pricing?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.pricing?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.pricing?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#c3c4c7]">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[13px] text-[#1d2327]">Pricing Tiers</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const plans = [...(form.pricing?.plans || [])];
                              plans.push({
                                name: "Custom Tier",
                                desc: "Plan description",
                                price: "$3,500",
                                period: "project",
                                isPopular: false,
                                isCustom: false,
                                badgeText: "",
                                tag: `PLAN 0${plans.length + 1}`,
                                ctaText: "Select Plan",
                                features: ["Feature 1", "Feature 2", "Feature 3"]
                              });
                              setForm({ ...form, pricing: { ...form.pricing, plans } });
                            }}
                            className="text-[12px] text-[#2271b1] hover:underline font-bold"
                          >
                            + Add Plan
                          </button>
                        </div>

                        {(form.pricing?.plans || []).map((plan: any, idx: number) => (
                          <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                            <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-1.5">
                              <span className="font-bold text-xs text-[#2271b1]">Tier 0{idx + 1}: {plan.name}</span>
                              <div className="flex items-center gap-3">
                                <label className="text-xs flex items-center gap-1 font-semibold cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={plan.isPopular || false}
                                    onChange={(e) => {
                                      const plans = [...form.pricing.plans];
                                      plans[idx] = { ...plans[idx], isPopular: e.target.checked };
                                      setForm({ ...form, pricing: { ...form.pricing, plans } });
                                    }}
                                  />
                                  Popular
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const plans = form.pricing.plans.filter((_: any, i: number) => i !== idx);
                                    setForm({ ...form, pricing: { ...form.pricing, plans } });
                                  }}
                                  className="text-[#d63638] text-xs font-bold hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                              <input
                                type="text"
                                placeholder="Tag (PLAN 01)"
                                value={plan.tag || ""}
                                onChange={(e) => {
                                  const plans = [...form.pricing.plans];
                                  plans[idx] = { ...plans[idx], tag: e.target.value };
                                  setForm({ ...form, pricing: { ...form.pricing, plans } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono"
                              />
                              <input
                                type="text"
                                placeholder="Plan Name"
                                value={plan.name}
                                onChange={(e) => {
                                  const plans = [...form.pricing.plans];
                                  plans[idx] = { ...plans[idx], name: e.target.value };
                                  setForm({ ...form, pricing: { ...form.pricing, plans } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold"
                              />
                              <input
                                type="text"
                                placeholder="Price ($4,850)"
                                value={plan.price}
                                onChange={(e) => {
                                  const plans = [...form.pricing.plans];
                                  plans[idx] = { ...plans[idx], price: e.target.value };
                                  setForm({ ...form, pricing: { ...form.pricing, plans } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <input
                                type="text"
                                placeholder="Period (project)"
                                value={plan.period}
                                onChange={(e) => {
                                  const plans = [...form.pricing.plans];
                                  plans[idx] = { ...plans[idx], period: e.target.value };
                                  setForm({ ...form, pricing: { ...form.pricing, plans } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <input
                                type="text"
                                placeholder="Badge (Most Popular)"
                                value={plan.badgeText || ""}
                                onChange={(e) => {
                                  const plans = [...form.pricing.plans];
                                  plans[idx] = { ...plans[idx], badgeText: e.target.value };
                                  setForm({ ...form, pricing: { ...form.pricing, plans } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-semibold text-[#2271b1]"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Description"
                                value={plan.desc}
                                onChange={(e) => {
                                  const plans = [...form.pricing.plans];
                                  plans[idx] = { ...plans[idx], desc: e.target.value };
                                  setForm({ ...form, pricing: { ...form.pricing, plans } });
                                }}
                                className="col-span-2 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <input
                                type="text"
                                placeholder="CTA Text"
                                value={plan.ctaText}
                                onChange={(e) => {
                                  const plans = [...form.pricing.plans];
                                  plans[idx] = { ...plans[idx], ctaText: e.target.value };
                                  setForm({ ...form, pricing: { ...form.pricing, plans } });
                                }}
                                className="border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="Features (comma separated)"
                              value={(plan.features || []).join(", ")}
                              onChange={(e) => {
                                const plans = [...form.pricing.plans];
                                plans[idx] = { ...plans[idx], features: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) };
                                setForm({ ...form, pricing: { ...form.pricing, plans } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 12: FINAL CTA */}
                  {activeTab === "final-cta" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Eyebrow</label>
                          <input
                            type="text"
                            value={form.finalCta?.eyebrow || ""}
                            onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, eyebrow: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Intro</label>
                          <input
                            type="text"
                            value={form.finalCta?.titleIntro || ""}
                            onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, titleIntro: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Highlight</label>
                          <input
                            type="text"
                            value={form.finalCta?.titleHighlight || ""}
                            onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, titleHighlight: e.target.value } })}
                            className="w-full border border-[#2271b1] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Title Line 2</label>
                          <input
                            type="text"
                            value={form.finalCta?.titleLine2 || ""}
                            onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, titleLine2: e.target.value } })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-[#1d2327]">Description</label>
                        <textarea
                          rows={3}
                          value={form.finalCta?.description || ""}
                          onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, description: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 13: FAQS */}
                  {activeTab === "faq" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-bold text-[#1d2327]">Service Specific FAQs</label>
                        <button
                          type="button"
                          onClick={() => {
                            const faqs = [...(form.faqs || [])];
                            faqs.push({ q: "Question here?", a: "Answer details here." });
                            setForm({ ...form, faqs });
                          }}
                          className="text-[12px] text-[#2271b1] hover:underline font-bold"
                        >
                          + Add FAQ
                        </button>
                      </div>

                      {(form.faqs || []).map((faq: any, idx: number) => (
                        <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              placeholder="Question"
                              value={faq.q || faq.question || ""}
                              onChange={(e) => {
                                const faqs = [...form.faqs];
                                faqs[idx] = { ...faqs[idx], q: e.target.value, question: e.target.value };
                                setForm({ ...form, faqs });
                              }}
                              className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-bold mr-2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const faqs = form.faqs.filter((_: any, i: number) => i !== idx);
                                setForm({ ...form, faqs });
                              }}
                              className="text-[#d63638] p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Answer"
                            value={faq.a || faq.answer || ""}
                            onChange={(e) => {
                              const faqs = [...form.faqs];
                              faqs[idx] = { ...faqs[idx], a: e.target.value, answer: e.target.value };
                              setForm({ ...form, faqs });
                            }}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 14: SEO */}
                  {activeTab === "seo" && (
                    <div className="space-y-4">
                      <SeoEditor
                        data={seo}
                        setData={setSeo}
                        pageSlug={`services/${form.slug}`}
                        pageTitle={form.title}
                        pageContent={form.hero?.description}
                      />
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Right Sidebar (#postbox-container-1) */}
            <div className="space-y-4">
              
              {/* Publish Metabox */}
              <div className="postbox bg-white border border-[#c3c4c7] shadow-sm rounded-[3px]">
                <h3 className="hndle font-bold px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7] text-[13px] text-[#1d2327]">
                  Publish
                </h3>
                <div className="p-3 space-y-3 text-[13px]">
                  <div className="flex items-center justify-between text-[#646970]">
                    <span>Status:</span>
                    <select
                      value={form.status || "published"}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="border border-[#8c8f94] px-2 py-0.5 rounded-[3px] text-xs font-semibold"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-[#646970]">
                    <span>Visibility:</span>
                    <strong className="text-[#1d2327] font-semibold text-xs">Public</strong>
                  </div>
                  <div className="pt-2 border-t border-[#c3c4c7] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="text-[#d63638] text-[13px] hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveService}
                      className="bg-[#2271b1] hover:bg-[#135e96] text-white px-3.5 py-1 rounded-[3px] text-[13px] font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {form.status === 'draft' ? 'Save Draft' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Attributes Metabox */}
              <div className="postbox bg-white border border-[#c3c4c7] shadow-sm rounded-[3px]">
                <h3 className="hndle font-bold px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7] text-[13px] text-[#1d2327]">
                  Service Attributes
                </h3>
                <div className="p-3 space-y-3 text-[13px]">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#646970]">Menu Icon</label>
                    <div><IconSelector value={form.icon || "Search"} onChange={(v) => setForm({ ...form, icon: v })} /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#646970]">Category Tag</label>
                    <input
                      type="text"
                      value={form.tag || ""}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* WordPress Classic Table List View */
        <div className="space-y-2">
          
          {/* Subsubsub Status Filter Links */}
          <ul className="subsubsub flex items-center gap-1.5 text-[13px] text-[#646970] my-2">
            <li>
              <button
                onClick={() => setFilter("all")}
                className={`${filter === 'all' ? 'font-bold text-[#1d2327]' : 'text-[#2271b1] hover:underline'}`}
              >
                All <span className="text-[#646970]">({services.length})</span>
              </button>
              <span className="mx-1.5 text-[#c3c4c7]">|</span>
            </li>
            <li>
              <button
                onClick={() => setFilter("published")}
                className={`${filter === 'published' ? 'font-bold text-[#1d2327]' : 'text-[#2271b1] hover:underline'}`}
              >
                Published <span className="text-[#646970]">({publishedCount})</span>
              </button>
              <span className="mx-1.5 text-[#c3c4c7]">|</span>
            </li>
            <li>
              <button
                onClick={() => setFilter("draft")}
                className={`${filter === 'draft' ? 'font-bold text-[#1d2327]' : 'text-[#2271b1] hover:underline'}`}
              >
                Drafts <span className="text-[#646970]">({draftCount})</span>
              </button>
            </li>
          </ul>

          {/* Tablenav Top */}
          <div className="tablenav top flex flex-wrap items-center justify-between gap-2 py-1.5">
            <div className="alignleft actions flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px]"
              >
                <option value="">Bulk actions</option>
                <option value="publish">Set to Published</option>
                <option value="draft">Set to Draft</option>
                <option value="delete">Delete</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!bulkAction || selectedIds.length === 0) return;
                  if (bulkAction === 'delete') {
                    if (!confirm(`Delete ${selectedIds.length} services?`)) return;
                    const newServices = services.filter((s: any) => !selectedIds.includes(s.id || s.slug));
                    saveToDb(newServices);
                    setSelectedIds([]);
                  } else {
                    const newStatus = bulkAction === 'publish' ? 'published' : 'draft';
                    const newServices = services.map((s: any) => selectedIds.includes(s.id || s.slug) ? { ...s, status: newStatus } : s);
                    saveToDb(newServices);
                    setSelectedIds([]);
                  }
                }}
                className="border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white px-2.5 py-1 text-[13px] font-medium rounded-[3px]"
              >
                Apply
              </button>
            </div>

            <div className="search-box">
              <input
                type="search"
                placeholder="Search Services"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#8c8f94] bg-white px-2.5 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          {/* WordPress Table */}
          <table className="wp-list-table widefat fixed striped posts w-full border border-[#c3c4c7] bg-white text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] text-[#1d2327]">
                <th className="p-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredServices.length && filteredServices.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredServices.map((s: any) => s.id || s.slug));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="p-2.5 font-bold">Title</th>
                <th className="p-2.5 font-bold w-36">Tag</th>
                <th className="p-2.5 font-bold w-48">Slug</th>
                <th className="p-2.5 font-bold w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c4c7]">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-[#646970]">No services found.</td>
                </tr>
              ) : (
                filteredServices.map((service: any, index: number) => {
                  const serviceIdentifier = service.id || service.slug;
                  const isChecked = selectedIds.includes(serviceIdentifier);
                  const ServiceIcon = IconComponentMap[service.icon] || Search;

                  return (
                    <tr key={index} className="hover:bg-[#f6f7f7] transition-colors group">
                      <td className="p-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, serviceIdentifier]);
                            else setSelectedIds(selectedIds.filter(id => id !== serviceIdentifier));
                          }}
                        />
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-[#f0f0f1] flex items-center justify-center text-[#50575e]">
                            <ServiceIcon className="w-3.5 h-3.5" />
                          </div>
                          <strong>
                            <button
                              onClick={() => handleEdit(service)}
                              className="text-[#2271b1] hover:underline font-bold text-left"
                            >
                              {service.title}
                            </button>
                          </strong>
                        </div>
                        {/* WordPress Hover Row Actions */}
                        <div className="row-actions text-[11px] text-[#646970] mt-1 space-x-1.5">
                          <span>
                            <button onClick={() => handleEdit(service)} className="text-[#2271b1] hover:underline">
                              Edit
                            </button>
                          </span>
                          <span className="text-[#c3c4c7]">|</span>
                          <span>
                            <button onClick={() => toggleStatus(service)} className="text-[#2271b1] hover:underline">
                              {service.status === 'draft' ? 'Publish' : 'Draft'}
                            </button>
                          </span>
                          <span className="text-[#c3c4c7]">|</span>
                          <span>
                            <button onClick={() => handleDelete(index)} className="text-[#d63638] hover:underline">
                              Trash
                            </button>
                          </span>
                          <span className="text-[#c3c4c7]">|</span>
                          <span>
                            <Link href={`/services/${service.slug}`} target="_blank" className="text-[#2271b1] hover:underline">
                              View
                            </Link>
                          </span>
                        </div>
                      </td>
                      <td className="p-2.5 text-[#50575e]">{service.tag || "—"}</td>
                      <td className="p-2.5 font-mono text-xs text-[#646970]">/services/{service.slug}</td>
                      <td className="p-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-[3px] text-[11px] font-bold uppercase ${
                          service.status === 'draft' ? 'bg-[#f0f0f1] text-[#50575e]' : 'bg-[#e7f5ea] text-[#00a32a]'
                        }`}>
                          {service.status === 'draft' ? 'Draft' : 'Published'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}
