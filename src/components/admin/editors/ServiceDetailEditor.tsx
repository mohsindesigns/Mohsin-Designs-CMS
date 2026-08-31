"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Plus, Trash2, Image as ImageIcon,
  CheckCircle2, Sparkles, Send, HelpCircle,
  Briefcase, Globe, DollarSign, Layers, ShieldCheck,
  TrendingUp, Terminal, Settings, Star, Award, Check, MapPin
} from "lucide-react";
import dynamic from "next/dynamic";
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";
import BlogSelector from "@/components/admin/BlogSelector";
import { AVAILABLE_COUNTRIES, resolveCountryLocation } from "@/lib/countryLocations";
import { UI } from "./styles";

// Safe comma separated input helper to prevent cursor swallowing
function CommaSeparatedInput({ value, onChange, placeholder, className }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; className?: string }) {
  const [text, setText] = useState((value || []).join(", "));

  useEffect(() => {
    const incoming = (value || []).join(", ");
    if (incoming !== text && text.split(",").map(s => s.trim()).filter(Boolean).join(", ") !== incoming) {
      setText(incoming);
    }
  }, [value]);

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const parsed = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
        onChange(parsed);
      }}
      placeholder={placeholder}
      className={className || UI.input}
    />
  );
}

export default function ServiceDetailEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
      setData({
        title: "Custom Web Application Engineering",
        slug: "custom-web-development",
        tag: "Premium Solution",
        hero: {
          titleIntro: "High-Performance",
          titleHighlight: "Web Applications",
          description: "Full-stack Next.js and React architecture engineered for sub-second speeds, high conversion rates, and enterprise scalability.",
          backgroundImage: "/portfolio_hero_bg.png",
          primaryCta: { text: "Start Your Project", link: "#contact-form" },
          secondaryCta: { text: "Explore Inclusions", link: "#what-included" },
          benefits: [
            "Data-Driven Growth Strategies",
            "Next.js Speed & Performance",
            "Conversion-Focused Architecture",
            "Dedicated Support & Real-Time Sync"
          ],
          formHeading: "Request a Free Technical Audit",
          formSubheading: "Direct architect consultation and custom scope estimation within 24 hours.",
          formButtonText: "Request Free Proposal"
        },
        clientTrust: {
          heading: "ENTERPRISE PLATFORMS WE INTEGRATE & ACCELERATE",
          logos: [
            { name: "Google Ads" },
            { name: "Meta Business" },
            { name: "Amazon Ads" },
            { name: "Bing Ads" },
            { name: "Apple Search" }
          ]
        },
        whatIncluded: {
          eyebrow: "03 // CORE CAPABILITIES",
          titleIntro: "What's Included in",
          titleHighlight: "Our Delivery",
          description: "Modular, full-cycle execution designed to remove technical bottlenecks and accelerate speed-to-market.",
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
            { metric: "350%", title: "Organic Visibility", desc: "Accelerating discovery on top search engines through clean structured code.", iconName: "TrendingUp" },
            { metric: "4.8x", title: "Conversion Yield", desc: "Frictionless UX funnels designed specifically to capture and convert leads.", iconName: "Target" },
            { metric: "99.9%", title: "Reliability & Uptime", desc: "Enterprise infrastructure built on modern serverless edge architecture.", iconName: "ShieldCheck" },
            { metric: "<1s", title: "Load Performance", desc: "Lightning fast asset delivery boosting Core Web Vitals and SEO rankings.", iconName: "Zap" }
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
            { title: "Discovery & Technical Diagnostics", desc: "Full audit of your digital ecosystem, tech stack, and user funnels.", phaseTag: "PHASE 01 // ARCHITECTURE", deliverables: ["Technical Audit", "Stack Mapping"], footerLeft: "Verification Checkpoint", footerRight: "Verified Node" },
            { title: "Architecture & Wireframing", desc: "Structuring high-converting user flows and component hierarchies.", phaseTag: "PHASE 02 // UI/UX DESIGN", deliverables: ["Figma Wireframes", "UX Flows"], footerLeft: "Verification Checkpoint", footerRight: "Verified Node" },
            { title: "Production Build & Optimization", desc: "Clean development with modern frameworks and strict performance standards.", phaseTag: "PHASE 03 // FULL-STACK", deliverables: ["Next.js Build", "API Endpoints"], footerLeft: "Verification Checkpoint", footerRight: "Verified Node" },
            { title: "Verification & Quality Assurance", desc: "Multi-device cross-browser testing and performance stress audits.", phaseTag: "PHASE 04 // QA AUDIT", deliverables: ["WCAG 2.1 Audit", "Stress Testing"], footerLeft: "Verification Checkpoint", footerRight: "Verified Node" }
          ]
        },
        results: {
          eyebrow: "07 // PROVEN PERFORMANCE",
          titleIntro: "Real-World",
          titleHighlight: "Impact & ROI",
          description: "Verifiable metric indicators driven by precise performance scaling and custom coding.",
          caseStudiesEyebrow: "Featured Case Studies",
          caseStudies: [
            { title: "Enterprise Brand Growth", challenge: "Slow load speeds and declining organic rankings on legacy stack.", strategy: "Engineered headless Next.js architecture with streamlined conversion pathways.", outcome: "+240% Inbound Leads", outcomeLabel: "Verified Outcome" },
            { title: "Multi-Location Regional Reach", challenge: "Poor regional visibility and high bounce rate on mobile users.", strategy: "Deployed localized landing architecture and high-authority schema markup.", outcome: "+410% Mobile Actions", outcomeLabel: "Verified Outcome" }
          ],
          metrics: [
            { value: "450%", label: "TRAFFIC GROWTH", desc: "Average organic session boost across engagements.", tag: "M01" },
            { value: "3.8x", label: "ROI MULTIPLIER", desc: "Documented revenue acceleration from attributed funnels.", tag: "M02" },
            { value: "99%", label: "CLIENT RETENTION", desc: "Long-term client partnerships built on consistent delivery.", tag: "M03" },
            { value: "24/7", label: "SUPPORT SYNC", desc: "Continuous uptime and real-time response capability.", tag: "M04" }
          ]
        },
        industries: {
          eyebrow: "08 // SECTORS WE ACCELERATE",
          titleIntro: "Industries",
          titleHighlight: "We Specialize In",
          description: "Every industry has distinct compliance, customer acquisition funnels, and technical requirements. We tailor our engineering to your exact vertical.",
          footerLeft: "Target Sector",
          footerRight: "Verified Optimization",
          list: [
            { title: "Home Services & Contracting", desc: "Roofing, remodeling, and local trade contractors scaling regional territories.", iconName: "Building2", watermark: "HS" },
            { title: "Technology & SaaS", desc: "Fast-growth software startups and tech firms demanding high conversion rates.", iconName: "Cpu", watermark: "TS" },
            { title: "Commercial Real Estate", desc: "Property developers, architectural firms, and luxury real estate agencies.", iconName: "Building2", watermark: "CR" },
            { title: "E-Commerce & Retail", desc: "Direct-to-consumer and B2B brands scaling transactions with seamless checkout.", iconName: "ShoppingCart", watermark: "EC" },
            { title: "Professional Services", desc: "Law firms, financial consultancies, and executive agencies building trust.", iconName: "Briefcase", watermark: "PS" },
            { title: "Healthcare & Wellness", desc: "Clinics, medical practices, and private health facilities seeking patient acquisition.", iconName: "Heart", watermark: "HW" }
          ]
        },
        tools: {
          eyebrow: "09 // TECH STACK",
          titleIntro: "Modern",
          titleHighlight: "Frameworks & Tools",
          description: "High-performance frameworks and analytics systems driving client ROI metrics.",
          list: [
            { name: "Next.js 15", iconName: "Monitor", tag: "CORE DEV", desc: "Headless rendering backend with automatic static optimization and route pre-fetching." },
            { name: "React.js", iconName: "Cpu", tag: "FRONTEND", desc: "Modular, reactive front-end library built for speedy interaction states." },
            { name: "Tailwind CSS", iconName: "Palette", tag: "STYLING", desc: "Utility-first CSS compiler to keep stylesheet sizes down and performance high." },
            { name: "Google Analytics 4", iconName: "BarChart2", tag: "DATA RUN", desc: "Server-side tag setup to capture 100% of campaign lead and attribution logs." },
            { name: "Google Search", iconName: "Search", tag: "SEO CORE", desc: "Indexation audits, keyword position mapping, and search volume gap tracing." },
            { name: "Vercel Edge", iconName: "Globe", tag: "EDGE NETWORK", desc: "Serverless global edge CDN network offering 99.9% uptime and instant caching." }
          ]
        },
        whyChooseUs: {
          eyebrow: "10 // THE ADVANTAGE",
          titleIntro: "Why Companies",
          titleHighlight: "Choose Us",
          description: "We bridge high-end visual design with deep architectural engineering for compounding returns.",
          stats: [
            { value: "99.8%", label: "ON-TIME LAUNCH", sublabel: "Sprint Accuracy", percentage: 0.99 },
            { value: "4.9★", label: "CLIENT RATING", sublabel: "Verified Feedback", percentage: 0.98 },
            { value: "100%", label: "CODE OWNERSHIP", sublabel: "Zero Lock-in", percentage: 1.0 }
          ],
          list: [
            { tag: "Differentiator 01", title: "Direct Lead Engineer Access", desc: "No junior account managers. You collaborate directly with senior architects throughout." },
            { tag: "Differentiator 02", title: "Sub-Second Speed Guarantee", desc: "Every project is optimized to score 95+ on Google Lighthouse Core Web Vitals." },
            { tag: "Differentiator 03", title: "Full Code Ownership & No Lock-in", desc: "Complete repository access, comprehensive documentation, and clean modular code." }
          ]
        },
        pricing: {
          eyebrow: "11 // TRANSPARENT INVESTMENT",
          titleIntro: "Predictable Pricing",
          titleHighlight: "Built for Scale",
          description: "Clear fixed scopes with zero hidden fees. Choose a sprint tier tailored to your immediate milestones.",
          plans: [
            {
              name: "Starter Sprint",
              tag: "PLAN 01",
              desc: "Ideal for early-stage products and targeted landing page overhauls.",
              price: "$2,800",
              period: "single sprint",
              features: ["Targeted UI/UX Architecture", "Next.js Fast Implementation", "Core SEO & Metadata", "2-Week Turnaround"],
              ctaText: "Select Starter",
              isPopular: false
            },
            {
              name: "Growth Architecture",
              tag: "PLAN 02",
              desc: "Comprehensive web application engineering with complete CMS integration.",
              price: "$5,500",
              period: "complete build",
              features: ["Full Custom UI/UX System", "Headless CMS Publishing", "Custom API Integrations", "Sub-Second Speed Guarantee", "30-Day Post-Launch SLA"],
              ctaText: "Select Growth",
              isPopular: true
            },
            {
              name: "Enterprise Custom",
              tag: "PLAN 03",
              desc: "Dedicated engineering team for complex multi-page platforms and portals.",
              price: "$9,500",
              period: "custom scope",
              features: ["Multi-Tenant Architecture", "Custom CRM & Database Sync", "Dedicated Architect Lead", "Priority 24/7 SLA Support"],
              ctaText: "Schedule Call",
              isCustom: true
            }
          ]
        },
        serviceArea: {
          sectionTag: "12 // GLOBAL REACH",
          titleIntro: "Serving Clients Across ",
          titleHighlight: "Prime Global Markets",
          description: "Deploying high-performance digital platforms across North America, Europe, and worldwide."
        },
        faqs: [
          { q: "How long does a typical service engagement take?", a: "Most focused sprints complete in 2 to 4 weeks, with full enterprise platforms averaging 4 to 6 weeks." },
          { q: "Do you provide ongoing support after deployment?", a: "Yes, we offer proactive monthly SLA maintenance, security updates, and performance monitoring." },
          { q: "Can you migrate our existing site without losing SEO rankings?", a: "Yes. We execute automated 301 redirect mapping, schema preservation, and complete metadata transfer." }
        ],
        finalCta: {
          eyebrow: "READY TO ACCELERATE?",
          titleIntro: "Let's Build Your Next",
          titleHighlight: "Competitive Edge",
          titleLine2: "Together.",
          description: "Schedule a free strategic consultation. We will audit your existing presence and map out a concrete blueprint for scalable growth.",
          primaryCtaText: "Schedule Discovery Session",
          primaryCtaLink: "#contact-form",
          secondaryCtaText: "Contact Office",
          secondaryCtaLink: "/contact",
          founderImage: "/founder_portrait_nobg.png"
        }
      });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateSection = (section: string, field: string | null, value: any) => {
    setData((prev: any) => {
      const currentData = prev || {};
      const sectionData = currentData[section] || {};
      if (field) {
        return {
          ...currentData,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return {
        ...currentData,
        [section]: value
      };
    });
  };

  const updateRootField = (field: string, value: any) => {
    setData((prev: any) => ({
      ...(prev || {}),
      [field]: value
    }));
  };

  const tabs = [
    { id: "hero", label: "1. Hero & Form" },
    { id: "clientTrust", label: "2. Client Trust" },
    { id: "whatIncluded", label: "3. Deliverables" },
    { id: "strategy", label: "4. Strategic Approach" },
    { id: "benefits", label: "5. Measurable Outcomes" },
    { id: "process", label: "6. Process Roadmap" },
    { id: "results", label: "7. Results & Case Studies" },
    { id: "industries", label: "8. Industry Sectors" },
    { id: "tools", label: "9. Tech Stack" },
    { id: "whyChooseUs", label: "10. The Advantage" },
    { id: "pricing", label: "11. Pricing Plans" },
    { id: "recommendedSection", label: "12. Recommended Pairings" },
    { id: "serviceArea", label: "13. Global Coverage" },
    { id: "faqs", label: "14. Page FAQs" },
    { id: "finalCta", label: "15. Final CTA Banner" },
    { id: "blogSection", label: "16. Related Insights" }
  ];

  return (
    <div className="bg-white max-w-3xl mx-auto pb-20">
      {/* WordPress Classic Sub-Tabs with Numbering */}
      <div className="flex flex-wrap items-center gap-1 mb-8 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button 
              type="button"
              onClick={() => setActiveTab(tab.id)} 
              className={`px-1 py-1 transition-colors cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-[#1d2327] font-bold border-b-2 border-[#2271b1]' 
                  : 'text-[#2271b1] hover:text-[#135e96]'
              }`}
            >
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="space-y-8"
          >

            {/* 1. HERO & EMBEDDED FORM */}
            {activeTab === "hero" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className={UI.sectionHeader}>1. Service Hero Headline & Narrative</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Service Display Title</label>
                      <input
                        type="text"
                        value={data.title || ""}
                        onChange={(e) => updateRootField("title", e.target.value)}
                        className={UI.inputLarge}
                        placeholder="e.g. Custom Web Development"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Service Tag / Category</label>
                      <input
                        type="text"
                        value={data.tag || ""}
                        onChange={(e) => updateRootField("tag", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. Premium Solution"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Headline Intro (Prefix)</label>
                      <input
                        type="text"
                        value={data.hero?.titleIntro || ""}
                        onChange={(e) => updateSection("hero", "titleIntro", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. Transform Your Business With"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Headline Highlight (Accent)</label>
                      <input
                        type="text"
                        value={data.hero?.titleHighlight || ""}
                        onChange={(e) => updateSection("hero", "titleHighlight", e.target.value)}
                        className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                        placeholder="e.g. Expert Solutions"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Hero Description (Supports Line Breaks & Paragraphs)</label>
                    <textarea
                      rows={4}
                      value={data.hero?.description || ""}
                      onChange={(e) => updateSection("hero", "description", e.target.value)}
                      className={UI.input}
                      placeholder="Enter detailed description. Line breaks will be preserved on the frontend."
                    />
                  </div>

                  <ImageField
                    label="Hero Background Artwork"
                    value={data.hero?.backgroundImage || data.hero?.bgImage || "/portfolio_hero_bg.png"}
                    onChange={(url) => updateSection("hero", "backgroundImage", url)}
                  />

                  <div className="space-y-1.5">
                    <label className={UI.label}>Hero Checklist Benefits (Comma Separated)</label>
                    <CommaSeparatedInput
                      value={data.hero?.benefits || []}
                      onChange={(arr) => updateSection("hero", "benefits", arr)}
                      placeholder="e.g. Next.js Speed, Dedicated Support, Sub-second Speeds"
                    />
                  </div>
                </div>

                {/* Hero Right-Side Form Customization */}
                <div className="space-y-4 pt-6 border-t border-[#f0f0f1]">
                  <h3 className={UI.sectionHeader}>2. Hero Embedded Consultation Form</h3>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Form Heading / Title</label>
                    <input
                      type="text"
                      value={data.hero?.formHeading || data.hero?.formTitle || "Request a Free Audit"}
                      onChange={(e) => updateSection("hero", "formHeading", e.target.value)}
                      className={UI.input + " font-bold"}
                      placeholder="e.g. Request a Free Technical Audit"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Form Subheading / Subtitle</label>
                    <input
                      type="text"
                      value={data.hero?.formSubheading || data.hero?.formSubtitle || "Direct architect consultation and custom scope estimation within 24 hours."}
                      onChange={(e) => updateSection("hero", "formSubheading", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. Connect directly with our lead architect."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Submit Button Label</label>
                    <input
                      type="text"
                      value={data.hero?.formButtonText || data.hero?.btnSubmit || "Request Free Proposal"}
                      onChange={(e) => updateSection("hero", "formButtonText", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. Claim Free Audit or Request Proposal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. CLIENT TRUST */}
            {activeTab === "clientTrust" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Platform Integration Logos & Proof</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Section Heading</label>
                  <input
                    type="text"
                    value={data.clientTrust?.heading || "ENTERPRISE PLATFORMS WE INTEGRATE & ACCELERATE"}
                    onChange={(e) => updateSection("clientTrust", "heading", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Trust / Integration Logos</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.clientTrust?.logos) ? data.clientTrust.logos : [];
                        updateSection("clientTrust", "logos", [...current, { name: "New Integration" }]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Logo
                    </button>
                  </div>

                  {(Array.isArray(data.clientTrust?.logos) ? data.clientTrust.logos : []).map((logo: any, idx: number) => (
                    <div key={idx} className={UI.card + " flex items-center gap-4"}>
                      <input
                        type="text"
                        value={logo.name || ""}
                        onChange={(e) => {
                          const list = [...(data.clientTrust?.logos || [])];
                          list[idx] = { ...list[idx], name: e.target.value };
                          updateSection("clientTrust", "logos", list);
                        }}
                        className={UI.input + " flex-1"}
                        placeholder="e.g. Google Ads, Meta, AWS"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = (data.clientTrust?.logos || []).filter((_: any, i: number) => i !== idx);
                          updateSection("clientTrust", "logos", list);
                        }}
                        className="text-[#d63638] hover:text-[#b32d2e] p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DELIVERABLES (WHAT'S INCLUDED) */}
            {activeTab === "whatIncluded" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Core Capabilities & Deliverables</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.whatIncluded?.eyebrow || "03 // CORE CAPABILITIES"}
                    onChange={(e) => updateSection("whatIncluded", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.whatIncluded?.titleIntro || "What's Included in"}
                      onChange={(e) => updateSection("whatIncluded", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.whatIncluded?.titleHighlight || "Our Delivery"}
                      onChange={(e) => updateSection("whatIncluded", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Description (Narrative)</label>
                  <textarea
                    rows={2}
                    value={data.whatIncluded?.description || ""}
                    onChange={(e) => updateSection("whatIncluded", "description", e.target.value)}
                    className={UI.input}
                    placeholder="Enter an optional overview narrative for this section."
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Delivery Pillar Cards</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.whatIncluded?.pillars) ? data.whatIncluded.pillars : [];
                        updateSection("whatIncluded", "pillars", [
                          ...current,
                          { title: "New Core Capability", desc: "Description of this deliverable.", features: [] }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Pillar Card
                    </button>
                  </div>

                  {(Array.isArray(data.whatIncluded?.pillars) ? data.whatIncluded.pillars : []).map((pillar: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Pillar #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.whatIncluded?.pillars || []).filter((_: any, i: number) => i !== idx);
                            updateSection("whatIncluded", "pillars", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Pillar Title</label>
                        <input
                          type="text"
                          value={pillar.title || ""}
                          onChange={(e) => {
                            const list = [...(data.whatIncluded?.pillars || [])];
                            list[idx] = { ...list[idx], title: e.target.value };
                            updateSection("whatIncluded", "pillars", list);
                          }}
                          className={UI.input}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Pillar Description</label>
                        <textarea
                          rows={2}
                          value={pillar.desc || ""}
                          onChange={(e) => {
                            const list = [...(data.whatIncluded?.pillars || [])];
                            list[idx] = { ...list[idx], desc: e.target.value };
                            updateSection("whatIncluded", "pillars", list);
                          }}
                          className={UI.input}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Bullet Features (Optional — Leave blank to hide bullet list)</label>
                        <CommaSeparatedInput
                          value={pillar.features || []}
                          onChange={(arr) => {
                            const list = [...(data.whatIncluded?.pillars || [])];
                            list[idx] = { ...list[idx], features: arr };
                            updateSection("whatIncluded", "pillars", list);
                          }}
                          placeholder="e.g. Technical Audit, QA Protocols (comma separated)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. STRATEGIC APPROACH */}
            {activeTab === "strategy" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Strategic Approach & Architecture</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.strategy?.eyebrow || "04 // STRATEGIC APPROACH"}
                    onChange={(e) => updateSection("strategy", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.strategy?.titleIntro || "Engineered For"}
                      onChange={(e) => updateSection("strategy", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.strategy?.titleHighlight || "Compounding Impact"}
                      onChange={(e) => updateSection("strategy", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <textarea
                    rows={2}
                    value={data.strategy?.description || ""}
                    onChange={(e) => updateSection("strategy", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Strategic Components</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.strategy?.components) ? data.strategy.components : [];
                        updateSection("strategy", "components", [
                          ...current,
                          { num: `0${current.length + 1}`, title: "New Strategic Step", desc: "Description of the step." }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Component
                    </button>
                  </div>

                  {(Array.isArray(data.strategy?.components) ? data.strategy.components : []).map((comp: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Step #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.strategy?.components || []).filter((_: any, i: number) => i !== idx);
                            updateSection("strategy", "components", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Number</label>
                          <input
                            type="text"
                            value={comp.num || `0${idx + 1}`}
                            onChange={(e) => {
                              const list = [...(data.strategy?.components || [])];
                              list[idx] = { ...list[idx], num: e.target.value };
                              updateSection("strategy", "components", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-3">
                          <label className={UI.label}>Component Title</label>
                          <input
                            type="text"
                            value={comp.title || ""}
                            onChange={(e) => {
                              const list = [...(data.strategy?.components || [])];
                              list[idx] = { ...list[idx], title: e.target.value };
                              updateSection("strategy", "components", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Description</label>
                        <textarea
                          rows={2}
                          value={comp.desc || ""}
                          onChange={(e) => {
                            const list = [...(data.strategy?.components || [])];
                            list[idx] = { ...list[idx], desc: e.target.value };
                            updateSection("strategy", "components", list);
                          }}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. MEASURABLE OUTCOMES (BENEFITS) */}
            {activeTab === "benefits" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Measurable Business Outcomes & Advantages</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.benefits?.eyebrow || "05 // MEASURABLE OUTCOMES"}
                    onChange={(e) => updateSection("benefits", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.benefits?.titleIntro || "Key Business"}
                      onChange={(e) => updateSection("benefits", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.benefits?.titleHighlight || "Advantages"}
                      onChange={(e) => updateSection("benefits", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Description</label>
                  <textarea
                    rows={2}
                    value={data.benefits?.description || ""}
                    onChange={(e) => updateSection("benefits", "description", e.target.value)}
                    className={UI.input}
                    placeholder="Enter optional description for measurable outcomes..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Outcome Guarantee Footer Label</label>
                  <input
                    type="text"
                    value={data.benefits?.outcomeText || "Guaranteed Outcome"}
                    onChange={(e) => updateSection("benefits", "outcomeText", e.target.value)}
                    className={UI.input}
                    placeholder="e.g. Guaranteed Outcome or Verified Node"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Outcome Metric Cards</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.benefits?.list) ? data.benefits.list : [];
                        updateSection("benefits", "list", [
                          ...current,
                          { metric: "100%", title: "New Verifiable Outcome", desc: "Outcome description.", tag: "Advantage", iconName: "TrendingUp" }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Outcome Card
                    </button>
                  </div>

                  {(Array.isArray(data.benefits?.list) ? data.benefits.list : []).map((b: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Outcome #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.benefits?.list || []).filter((_: any, i: number) => i !== idx);
                            updateSection("benefits", "list", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Tag / Badge</label>
                          <input
                            type="text"
                            value={b.tag || ""}
                            onChange={(e) => {
                              const list = [...(data.benefits?.list || [])];
                              list[idx] = { ...list[idx], tag: e.target.value };
                              updateSection("benefits", "list", list);
                            }}
                            className={UI.input}
                            placeholder="Organic Reach"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Metric (e.g. 350%, 4.8x, &lt;1s)</label>
                          <input
                            type="text"
                            value={b.metric || ""}
                            onChange={(e) => {
                              const list = [...(data.benefits?.list || [])];
                              list[idx] = { ...list[idx], metric: e.target.value };
                              updateSection("benefits", "list", list);
                            }}
                            className={UI.input + " font-black"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Card Icon</label>
                          <IconSelector
                            value={b.iconName || b.icon || "TrendingUp"}
                            onChange={(icon) => {
                              const list = [...(data.benefits?.list || [])];
                              list[idx] = { ...list[idx], iconName: icon, icon: icon };
                              updateSection("benefits", "list", list);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Outcome Title</label>
                        <input
                          type="text"
                          value={b.title || ""}
                          onChange={(e) => {
                            const list = [...(data.benefits?.list || [])];
                            list[idx] = { ...list[idx], title: e.target.value };
                            updateSection("benefits", "list", list);
                          }}
                          className={UI.input}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Outcome Description</label>
                        <textarea
                          rows={2}
                          value={b.desc || b.description || ""}
                          onChange={(e) => {
                            const list = [...(data.benefits?.list || [])];
                            list[idx] = { ...list[idx], desc: e.target.value, description: e.target.value };
                            updateSection("benefits", "list", list);
                          }}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PROCESS ROADMAP */}
            {activeTab === "process" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Implementation Roadmap & Process Sprints</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.process?.eyebrow || "06 // IMPLEMENTATION ROADMAP"}
                    onChange={(e) => updateSection("process", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.process?.titleIntro || "Our Step-by-Step"}
                      onChange={(e) => updateSection("process", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.process?.titleHighlight || "Roadmap"}
                      onChange={(e) => updateSection("process", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <textarea
                    rows={2}
                    value={data.process?.description || ""}
                    onChange={(e) => updateSection("process", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Process Callout Tag / Badge (Optional)</label>
                    <input
                      type="text"
                      value={data.process?.calloutTag || ""}
                      onChange={(e) => updateSection("process", "calloutTag", e.target.value)}
                      className={UI.input + " font-mono text-xs"}
                      placeholder="e.g. // PROCESS COMPLIANCE"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Process Callout Description (Optional)</label>
                    <input
                      type="text"
                      value={data.process?.calloutText || ""}
                      onChange={(e) => updateSection("process", "calloutText", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. Every milestone is cataloged in the shared workspace..."
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Roadmap Sprints / Milestones</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.process?.steps) ? data.process.steps : [];
                        updateSection("process", "steps", [
                          ...current,
                          {
                            title: "New Sprint Milestone",
                            desc: "Description of the sprint.",
                            phaseTag: `PHASE 0${current.length + 1} // SPRINT`,
                            deliverables: ["Deliverable 1", "Deliverable 2"],
                            footerLeft: "Verification Checkpoint",
                            footerRight: "Verified Node"
                          }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Milestone Step
                    </button>
                  </div>

                  {(Array.isArray(data.process?.steps) ? data.process.steps : []).map((step: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Step #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.process?.steps || []).filter((_: any, i: number) => i !== idx);
                            updateSection("process", "steps", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Phase Badge (e.g. PHASE 01 // DISCOVERY)</label>
                          <input
                            type="text"
                            value={step.phaseTag || `PHASE 0${idx + 1} // SPRINT`}
                            onChange={(e) => {
                              const list = [...(data.process?.steps || [])];
                              list[idx] = { ...list[idx], phaseTag: e.target.value };
                              updateSection("process", "steps", list);
                            }}
                            className={UI.input + " font-mono text-xs"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Milestone Title</label>
                          <input
                            type="text"
                            value={step.title || ""}
                            onChange={(e) => {
                              const list = [...(data.process?.steps || [])];
                              list[idx] = { ...list[idx], title: e.target.value };
                              updateSection("process", "steps", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Description</label>
                        <textarea
                          rows={2}
                          value={step.desc || ""}
                          onChange={(e) => {
                            const list = [...(data.process?.steps || [])];
                            list[idx] = { ...list[idx], desc: e.target.value };
                            updateSection("process", "steps", list);
                          }}
                          className={UI.input}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Checklist Deliverables (Comma Separated)</label>
                        <CommaSeparatedInput
                          value={step.deliverables || []}
                          onChange={(arr) => {
                            const list = [...(data.process?.steps || [])];
                            list[idx] = { ...list[idx], deliverables: arr };
                            updateSection("process", "steps", list);
                          }}
                          placeholder="e.g. Wireframe System, Architecture Audit"
                        />
                      </div>

                      <ImageField
                        label="Step Artwork Image (Optional)"
                        value={step.image || ""}
                        onChange={(url) => {
                          const list = [...(data.process?.steps || [])];
                          list[idx] = { ...list[idx], image: url };
                          updateSection("process", "steps", list);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. RESULTS & CASE STUDIES */}
            {activeTab === "results" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className={UI.sectionHeader}>Featured Case Studies & Proof</h3>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Badge / Eyebrow</label>
                    <input
                      type="text"
                      value={data.results?.eyebrow || "07 // PROVEN PERFORMANCE"}
                      onChange={(e) => updateSection("results", "eyebrow", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={data.results?.titleIntro || "Real-World"}
                        onChange={(e) => updateSection("results", "titleIntro", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Highlight</label>
                      <input
                        type="text"
                        value={data.results?.titleHighlight || "Impact & ROI"}
                        onChange={(e) => updateSection("results", "titleHighlight", e.target.value)}
                        className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Section Description</label>
                    <textarea
                      rows={2}
                      value={data.results?.description || ""}
                      onChange={(e) => updateSection("results", "description", e.target.value)}
                      className={UI.input}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Case Studies Section Label</label>
                    <input
                      type="text"
                      value={data.results?.caseStudiesEyebrow || "Featured Case Studies"}
                      onChange={(e) => updateSection("results", "caseStudiesEyebrow", e.target.value)}
                      className={UI.input + " font-mono text-xs"}
                    />
                  </div>
                </div>

                {/* Case Studies Cards */}
                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Dynamic Case Studies</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.results?.caseStudies) ? data.results.caseStudies : [];
                        updateSection("results", "caseStudies", [
                          ...current,
                          { title: "New Client Success", challenge: "Challenge description.", strategy: "Strategic solution executed.", outcome: "+300% Inbound Leads", outcomeLabel: "Verified Outcome" }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Case Study
                    </button>
                  </div>

                  {(Array.isArray(data.results?.caseStudies) ? data.results.caseStudies : []).map((cs: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Case Study #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.results?.caseStudies || []).filter((_: any, i: number) => i !== idx);
                            updateSection("results", "caseStudies", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className={UI.label}>Client / Case Title</label>
                          <input
                            type="text"
                            value={cs.title || ""}
                            onChange={(e) => {
                              const list = [...(data.results?.caseStudies || [])];
                              list[idx] = { ...list[idx], title: e.target.value };
                              updateSection("results", "caseStudies", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Case Icon</label>
                          <IconSelector
                            value={cs.iconName || cs.icon || "Target"}
                            onChange={(icon) => {
                              const list = [...(data.results?.caseStudies || [])];
                              list[idx] = { ...list[idx], iconName: icon, icon: icon };
                              updateSection("results", "caseStudies", list);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Outcome Metric (e.g. +240% Inbound)</label>
                        <input
                          type="text"
                          value={cs.outcome || ""}
                          onChange={(e) => {
                            const list = [...(data.results?.caseStudies || [])];
                            list[idx] = { ...list[idx], outcome: e.target.value };
                            updateSection("results", "caseStudies", list);
                          }}
                          className={UI.input + " font-black text-[#2271b1]"}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Challenge Statement</label>
                        <textarea
                          rows={2}
                          value={cs.challenge || ""}
                          onChange={(e) => {
                            const list = [...(data.results?.caseStudies || [])];
                            list[idx] = { ...list[idx], challenge: e.target.value };
                            updateSection("results", "caseStudies", list);
                          }}
                          className={UI.input}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Strategy & Architecture Solution</label>
                        <textarea
                          rows={2}
                          value={cs.strategy || ""}
                          onChange={(e) => {
                            const list = [...(data.results?.caseStudies || [])];
                            list[idx] = { ...list[idx], strategy: e.target.value };
                            updateSection("results", "caseStudies", list);
                          }}
                          className={UI.input}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Outcome Label</label>
                          <input
                            type="text"
                            value={cs.outcomeLabel || "Verified Outcome"}
                            onChange={(e) => {
                              const list = [...(data.results?.caseStudies || [])];
                              list[idx] = { ...list[idx], outcomeLabel: e.target.value };
                              updateSection("results", "caseStudies", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Short Description</label>
                          <input
                            type="text"
                            value={cs.desc || ""}
                            onChange={(e) => {
                              const list = [...(data.results?.caseStudies || [])];
                              list[idx] = { ...list[idx], desc: e.target.value };
                              updateSection("results", "caseStudies", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Side Stats Counters */}
                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Performance Stat Counters (Cards)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.results?.metrics) ? data.results.metrics : [];
                        updateSection("results", "metrics", [
                          ...current,
                          { value: "+300%", label: "NEW METRIC", desc: "Measurable impact description.", tag: `M0${current.length + 1}`, iconName: "TrendingUp" }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Metric Card
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(Array.isArray(data.results?.metrics) ? data.results.metrics : []).map((metric: any, idx: number) => (
                      <div key={idx} className={UI.card + " space-y-3"}>
                        <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                          <span className="text-[10px] font-bold text-[#646970] uppercase">Performance Card #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = (data.results?.metrics || []).filter((_: any, i: number) => i !== idx);
                              updateSection("results", "metrics", list);
                            }}
                            className="text-[#d63638] hover:text-[#b32d2e] p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className={UI.label}>Stat Value</label>
                            <input
                              type="text"
                              value={metric.value || ""}
                              onChange={(e) => {
                                const list = [...(data.results?.metrics || [])];
                                list[idx] = { ...list[idx], value: e.target.value };
                                updateSection("results", "metrics", list);
                              }}
                              className={UI.input + " font-black"}
                              placeholder="e.g. 450%"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={UI.label}>Stat Label</label>
                            <input
                              type="text"
                              value={metric.label || ""}
                              onChange={(e) => {
                                const list = [...(data.results?.metrics || [])];
                                list[idx] = { ...list[idx], label: e.target.value };
                                updateSection("results", "metrics", list);
                              }}
                              className={UI.input}
                              placeholder="e.g. TRAFFIC GROWTH"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className={UI.label}>Badge Tag</label>
                            <input
                              type="text"
                              value={metric.tag || `M0${idx + 1}`}
                              onChange={(e) => {
                                const list = [...(data.results?.metrics || [])];
                                list[idx] = { ...list[idx], tag: e.target.value };
                                updateSection("results", "metrics", list);
                              }}
                              className={UI.input + " font-mono text-xs"}
                              placeholder="e.g. M01"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={UI.label}>Card Icon</label>
                            <IconSelector
                              value={metric.iconName || metric.icon || "Trophy"}
                              onChange={(icon) => {
                                const list = [...(data.results?.metrics || [])];
                                list[idx] = { ...list[idx], iconName: icon, icon: icon };
                                updateSection("results", "metrics", list);
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={UI.label}>Description</label>
                          <input
                            type="text"
                            value={metric.desc || ""}
                            onChange={(e) => {
                              const list = [...(data.results?.metrics || [])];
                              list[idx] = { ...list[idx], desc: e.target.value };
                              updateSection("results", "metrics", list);
                            }}
                            className={UI.input}
                            placeholder="Average organic session boost across 12-month engagements."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. INDUSTRY SECTORS */}
            {activeTab === "industries" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Industry Sectors We Accelerate</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.industries?.eyebrow || "08 // SECTORS WE ACCELERATE"}
                    onChange={(e) => updateSection("industries", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.industries?.titleIntro || "Industries"}
                      onChange={(e) => updateSection("industries", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.industries?.titleHighlight || "We Specialize In"}
                      onChange={(e) => updateSection("industries", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Description (Frontend Narrative)</label>
                  <textarea
                    rows={3}
                    value={data.industries?.description || "Every industry has distinct compliance, customer acquisition funnels, and technical requirements. We tailor our engineering to your exact vertical."}
                    onChange={(e) => updateSection("industries", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Industry Sector Cards</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.industries?.list) ? data.industries.list : [];
                        updateSection("industries", "list", [
                          ...current,
                          { title: "New Industry Sector", desc: "Specialized vertical capability tailored for growth.", iconName: "Building2", watermark: "IS" }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Sector Card
                    </button>
                  </div>

                  {(Array.isArray(data.industries?.list) ? data.industries.list : []).map((ind: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Sector Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.industries?.list || []).filter((_: any, i: number) => i !== idx);
                            updateSection("industries", "list", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Industry Title</label>
                        <input
                          type="text"
                          value={ind.title || ""}
                          onChange={(e) => {
                            const list = [...(data.industries?.list || [])];
                            list[idx] = { ...list[idx], title: e.target.value };
                            updateSection("industries", "list", list);
                          }}
                          className={UI.input}
                          placeholder="e.g. Home Services & Contracting"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Card Icon</label>
                        <IconSelector
                          value={ind.iconName || "Building2"}
                          onChange={(icon) => {
                            const list = [...(data.industries?.list || [])];
                            list[idx] = { ...list[idx], iconName: icon };
                            updateSection("industries", "list", list);
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Description</label>
                        <textarea
                          rows={2}
                          value={ind.desc || ind.description || ""}
                          onChange={(e) => {
                            const list = [...(data.industries?.list || [])];
                            list[idx] = { ...list[idx], desc: e.target.value };
                            updateSection("industries", "list", list);
                          }}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. TECH STACK */}
            {activeTab === "tools" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Modern Tech Stack & Frameworks</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.tools?.eyebrow || "09 // TECH STACK"}
                    onChange={(e) => updateSection("tools", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.tools?.titleIntro || "Modern"}
                      onChange={(e) => updateSection("tools", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.tools?.titleHighlight || "Frameworks & Tools"}
                      onChange={(e) => updateSection("tools", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Description</label>
                  <textarea
                    rows={2}
                    value={data.tools?.description || "High-performance frameworks and analytics systems driving client ROI metrics."}
                    onChange={(e) => updateSection("tools", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Tech Stack Cards</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.tools?.list) ? data.tools.list : [];
                        updateSection("tools", "list", [
                          ...current,
                          { name: "New Framework", tag: "FRONTEND", iconName: "Monitor", desc: "Tool description." }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Tech Card
                    </button>
                  </div>

                  {(Array.isArray(data.tools?.list) ? data.tools.list : []).map((tool: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Tool #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.tools?.list || []).filter((_: any, i: number) => i !== idx);
                            updateSection("tools", "list", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Tool / Framework Name</label>
                          <input
                            type="text"
                            value={tool.name || ""}
                            onChange={(e) => {
                              const list = [...(data.tools?.list || [])];
                              list[idx] = { ...list[idx], name: e.target.value };
                              updateSection("tools", "list", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Category Tag (e.g. CORE DEV, FRONTEND, STYLING)</label>
                          <input
                            type="text"
                            value={tool.tag || ""}
                            onChange={(e) => {
                              const list = [...(data.tools?.list || [])];
                              list[idx] = { ...list[idx], tag: e.target.value };
                              updateSection("tools", "list", list);
                            }}
                            className={UI.input + " font-mono text-xs"}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Tool Icon</label>
                        <IconSelector
                          value={tool.iconName || "Monitor"}
                          onChange={(icon) => {
                            const list = [...(data.tools?.list || [])];
                            list[idx] = { ...list[idx], iconName: icon };
                            updateSection("tools", "list", list);
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Description</label>
                        <textarea
                          rows={2}
                          value={tool.desc || tool.description || ""}
                          onChange={(e) => {
                            const list = [...(data.tools?.list || [])];
                            list[idx] = { ...list[idx], desc: e.target.value };
                            updateSection("tools", "list", list);
                          }}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. THE ADVANTAGE (WHY CHOOSE US) */}
            {activeTab === "whyChooseUs" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>The Advantage (Differentiators & Proof)</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.whyChooseUs?.eyebrow || "10 // THE ADVANTAGE"}
                    onChange={(e) => updateSection("whyChooseUs", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.whyChooseUs?.titleIntro || "Why Companies"}
                      onChange={(e) => updateSection("whyChooseUs", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.whyChooseUs?.titleHighlight || "Choose Us"}
                      onChange={(e) => updateSection("whyChooseUs", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <textarea
                    rows={2}
                    value={data.whyChooseUs?.description || ""}
                    onChange={(e) => updateSection("whyChooseUs", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                {/* Circular Stat Rings */}
                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Circular Stat Rings (Left Column)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.whyChooseUs?.stats) ? data.whyChooseUs.stats : [];
                        updateSection("whyChooseUs", "stats", [
                          ...current,
                          { value: "100%", label: "NEW STAT", sublabel: "Description\\nLine 2", percentage: 0.85 }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Stat Ring
                    </button>
                  </div>

                  {(Array.isArray(data.whyChooseUs?.stats) ? data.whyChooseUs.stats : []).map((st: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-3"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Stat Ring #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.whyChooseUs?.stats || []).filter((_: any, i: number) => i !== idx);
                            updateSection("whyChooseUs", "stats", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className={UI.label}>Display Value</label>
                          <input
                            type="text"
                            value={st.value || ""}
                            onChange={(e) => {
                              const list = [...(data.whyChooseUs?.stats || [])];
                              list[idx] = { ...list[idx], value: e.target.value };
                              updateSection("whyChooseUs", "stats", list);
                            }}
                            className={UI.input + " font-black"}
                            placeholder="e.g. 100% or 4.5x"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={UI.label}>Label</label>
                          <input
                            type="text"
                            value={st.label || ""}
                            onChange={(e) => {
                              const list = [...(data.whyChooseUs?.stats || [])];
                              list[idx] = { ...list[idx], label: e.target.value };
                              updateSection("whyChooseUs", "stats", list);
                            }}
                            className={UI.input}
                            placeholder="e.g. PERFORMANCE"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={UI.label}>Sublabel</label>
                          <input
                            type="text"
                            value={st.sublabel || ""}
                            onChange={(e) => {
                              const list = [...(data.whyChooseUs?.stats || [])];
                              list[idx] = { ...list[idx], sublabel: e.target.value };
                              updateSection("whyChooseUs", "stats", list);
                            }}
                            className={UI.input}
                            placeholder="Use \\n for line break"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={UI.label}>Fill % (0-1)</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="1"
                            value={st.percentage ?? 0.85}
                            onChange={(e) => {
                              const list = [...(data.whyChooseUs?.stats || [])];
                              list[idx] = { ...list[idx], percentage: parseFloat(e.target.value) || 0.85 };
                              updateSection("whyChooseUs", "stats", list);
                            }}
                            className={UI.input + " font-mono"}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Differentiator Rows */}
                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Differentiator Rows</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.whyChooseUs?.list) ? data.whyChooseUs.list : [];
                        updateSection("whyChooseUs", "list", [
                          ...current,
                          { tag: `Differentiator 0${current.length + 1}`, title: "New Key Advantage", desc: "Description of the advantage." }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Differentiator
                    </button>
                  </div>

                  {(Array.isArray(data.whyChooseUs?.list) ? data.whyChooseUs.list : []).map((item: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Advantage #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.whyChooseUs?.list || []).filter((_: any, i: number) => i !== idx);
                            updateSection("whyChooseUs", "list", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Tag</label>
                          <input
                            type="text"
                            value={item.tag || `Differentiator 0${idx + 1}`}
                            onChange={(e) => {
                              const list = [...(data.whyChooseUs?.list || [])];
                              list[idx] = { ...list[idx], tag: e.target.value };
                              updateSection("whyChooseUs", "list", list);
                            }}
                            className={UI.input + " font-mono text-xs"}
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className={UI.label}>Title</label>
                          <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) => {
                              const list = [...(data.whyChooseUs?.list || [])];
                              list[idx] = { ...list[idx], title: e.target.value };
                              updateSection("whyChooseUs", "list", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Card Icon</label>
                        <IconSelector
                          value={item.icon || item.iconName || "CheckCircle2"}
                          onChange={(icon) => {
                            const list = [...(data.whyChooseUs?.list || [])];
                            list[idx] = { ...list[idx], icon: icon, iconName: icon };
                            updateSection("whyChooseUs", "list", list);
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Description</label>
                        <textarea
                          rows={2}
                          value={item.desc || ""}
                          onChange={(e) => {
                            const list = [...(data.whyChooseUs?.list || [])];
                            list[idx] = { ...list[idx], desc: e.target.value };
                            updateSection("whyChooseUs", "list", list);
                          }}
                          className={UI.input}
                          placeholder="Key value proposition narrative."
                        />
                      </div>

                      <ImageField
                        label="Right-Side Artwork Image (Replaces Default SVG Illustration)"
                        value={item.image || ""}
                        onChange={(url) => {
                          const list = [...(data.whyChooseUs?.list || [])];
                          list[idx] = { ...list[idx], image: url };
                          updateSection("whyChooseUs", "list", list);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. PRICING PLANS */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Pricing Plans & Sprint Packages</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.pricing?.eyebrow || "11 // TRANSPARENT INVESTMENT"}
                    onChange={(e) => updateSection("pricing", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.pricing?.titleIntro || "Predictable Pricing"}
                      onChange={(e) => updateSection("pricing", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.pricing?.titleHighlight || "Built for Scale"}
                      onChange={(e) => updateSection("pricing", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Description (Frontend Narrative)</label>
                  <textarea
                    rows={2}
                    value={data.pricing?.description || "Clear fixed scopes with zero hidden fees. Choose a sprint tier tailored to your immediate milestones."}
                    onChange={(e) => updateSection("pricing", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <div className="flex items-center justify-between">
                    <span className={UI.label}>Pricing Cards</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(data.pricing?.plans) ? data.pricing.plans : [];
                        updateSection("pricing", "plans", [
                          ...current,
                          {
                            name: "New Plan Tier",
                            tag: `PLAN 0${current.length + 1}`,
                            desc: "Plan description.",
                            price: "$3,000",
                            period: "single sprint",
                            features: ["Feature 1", "Feature 2"],
                            ctaText: "Select Plan"
                          }
                        ]);
                      }}
                      className={UI.buttonAdd}
                    >
                      <Plus className="w-3 h-3" /> Add Plan Tier
                    </button>
                  </div>

                  {(Array.isArray(data.pricing?.plans) ? data.pricing.plans : []).map((plan: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Plan #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.pricing?.plans || []).filter((_: any, i: number) => i !== idx);
                            updateSection("pricing", "plans", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className={UI.label}>Plan Name</label>
                          <input
                            type="text"
                            value={plan.name || ""}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], name: e.target.value };
                              updateSection("pricing", "plans", list);
                            }}
                            className={UI.input + " font-bold"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Plan Tag / Badge</label>
                          <input
                            type="text"
                            value={plan.tag || `PLAN 0${idx + 1}`}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], tag: e.target.value };
                              updateSection("pricing", "plans", list);
                            }}
                            className={UI.input + " font-mono text-xs"}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Price (e.g. $2,800 or Custom)</label>
                          <input
                            type="text"
                            value={plan.price || ""}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], price: e.target.value };
                              updateSection("pricing", "plans", list);
                            }}
                            className={UI.input + " font-black"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Billing Period (e.g. per sprint, month, build)</label>
                          <input
                            type="text"
                            value={plan.period || ""}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], period: e.target.value };
                              updateSection("pricing", "plans", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Plan Description</label>
                        <textarea
                          rows={2}
                          value={plan.desc || ""}
                          onChange={(e) => {
                            const list = [...(data.pricing?.plans || [])];
                            list[idx] = { ...list[idx], desc: e.target.value };
                            updateSection("pricing", "plans", list);
                          }}
                          className={UI.input}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Features Checklist (Comma Separated)</label>
                        <CommaSeparatedInput
                          value={plan.features || []}
                          onChange={(arr) => {
                            const list = [...(data.pricing?.plans || [])];
                            list[idx] = { ...list[idx], features: arr };
                            updateSection("pricing", "plans", list);
                          }}
                          placeholder="e.g. UI/UX Architecture, Next.js Build, SEO Setup"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>CTA Button Label</label>
                          <input
                            type="text"
                            value={plan.ctaText || "Select Plan"}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], ctaText: e.target.value };
                              updateSection("pricing", "plans", list);
                            }}
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>CTA Button Link (Optional)</label>
                          <input
                            type="text"
                            value={plan.ctaLink || ""}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], ctaLink: e.target.value };
                              updateSection("pricing", "plans", list);
                            }}
                            className={UI.input}
                            placeholder="e.g. #contact-form or /contact"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#1d2327] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(plan.isPopular)}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], isPopular: e.target.checked };
                              updateSection("pricing", "plans", list);
                            }}
                            className="rounded border-[#c3c4c7] text-[#2271b1]"
                          />
                          Highlight as "Most Popular"
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Custom Badge Text (Optional)</label>
                          <input
                            type="text"
                            value={plan.badgeText || ""}
                            onChange={(e) => {
                              const list = [...(data.pricing?.plans || [])];
                              list[idx] = { ...list[idx], badgeText: e.target.value };
                              updateSection("pricing", "plans", list);
                            }}
                            className={UI.input}
                            placeholder="e.g. Best Value, Enterprise"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <label className="flex items-center gap-2 text-xs font-bold text-[#1d2327] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(plan.isCustom)}
                              onChange={(e) => {
                                const list = [...(data.pricing?.plans || [])];
                                list[idx] = { ...list[idx], isCustom: e.target.checked };
                                updateSection("pricing", "plans", list);
                              }}
                              className="rounded border-[#c3c4c7] text-[#2271b1]"
                            />
                            Mark as "Custom Scoped"
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12. RECOMMENDED PAIRINGS SECTION */}
            {activeTab === "recommendedSection" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Recommended Pairings Section</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.recommendedSection?.eyebrow || "11 // RECOMMENDATION"}
                    onChange={(e) => updateSection("recommendedSection", "eyebrow", e.target.value)}
                    className={UI.input}
                    placeholder="e.g. 11 // RECOMMENDATION"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.recommendedSection?.titleIntro || "Services That Pair"}
                      onChange={(e) => updateSection("recommendedSection", "titleIntro", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. Services That Pair"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.recommendedSection?.titleHighlight || "Perfect Together"}
                      onChange={(e) => updateSection("recommendedSection", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                      placeholder="e.g. Perfect Together"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description Narrative</label>
                  <textarea
                    rows={3}
                    value={data.recommendedSection?.description || "Scale faster by pairing multi-channel growth campaigns and high-performance visual coding solutions."}
                    onChange={(e) => updateSection("recommendedSection", "description", e.target.value)}
                    className={UI.input}
                    placeholder="Overview narrative for recommended services section."
                  />
                </div>
              </div>
            )}

            {/* 13. GLOBAL COVERAGE (SERVICE AREA) */}
            {activeTab === "serviceArea" && (
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>1. Section Header & Narrative</h3>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Badge / Tag</label>
                    <input
                      type="text"
                      value={data.serviceArea?.sectionTag || "12 // GLOBAL REACH"}
                      onChange={(e) => updateSection("serviceArea", "sectionTag", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. 12 // GLOBAL REACH"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={data.serviceArea?.titleIntro || "Serving Clients Across "}
                        onChange={(e) => updateSection("serviceArea", "titleIntro", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. Serving Clients Across "
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Highlight</label>
                      <input
                        type="text"
                        value={data.serviceArea?.titleHighlight || "Prime Global Markets"}
                        onChange={(e) => updateSection("serviceArea", "titleHighlight", e.target.value)}
                        className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                        placeholder="e.g. Prime Global Markets"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Description</label>
                    <textarea
                      rows={2}
                      value={data.serviceArea?.description || "Deploying high-performance digital platforms across North America, Europe, and worldwide."}
                      onChange={(e) => updateSection("serviceArea", "description", e.target.value)}
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
                        value={data.serviceArea?.ctaText || "Schedule Global Consultation"}
                        onChange={(e) => updateSection("serviceArea", "ctaText", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. Schedule Global Consultation"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={data.serviceArea?.ctaHref || "#contact-form"}
                        onChange={(e) => updateSection("serviceArea", "ctaHref", e.target.value)}
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
                        const currentHubs = (Array.isArray(data.serviceArea?.hubs) && data.serviceArea.hubs.length > 0)
                          ? data.serviceArea.hubs
                          : [
                            { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                            { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                            { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                            { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" }
                          ];
                        const newHub = { id: `hub-${Date.now()}`, name: "California, USA", focus: "Regional Hub", timezone: "PST", link: "/locations" };
                        updateSection("serviceArea", "hubs", [...currentHubs, newHub]);
                      }}
                      className={UI.buttonAdd}
                    >
                      + Add Location Hub
                    </button>
                  </div>

                  <div className="space-y-4">
                    {((Array.isArray(data.serviceArea?.hubs) && data.serviceArea.hubs.length > 0)
                      ? data.serviceArea.hubs
                      : [
                        { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                        { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                        { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                        { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" }
                      ]
                    ).map((hub: any, hIdx: number) => {
                      const currentHubs = (Array.isArray(data.serviceArea?.hubs) && data.serviceArea.hubs.length > 0)
                        ? data.serviceArea.hubs
                        : [
                          { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                          { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                          { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                          { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" }
                        ];
                      const geo = resolveCountryLocation(hub.name);

                      return (
                        <div key={hIdx} className={UI.card + " space-y-3 bg-[#f6f7f7] border border-[#dcdcde]"}>
                          <div className="flex justify-between items-center pb-2 border-b border-[#e2e4e7]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <MapPin className="w-4 h-4 text-[#2271b1]" />
                              <span className="text-[13px] font-bold text-[#1d2327]">{hub.name || `Location #${hIdx + 1}`}</span>
                              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                📍 Auto-Geolocated ({geo.region})
                              </span>
                              {hub.link && (
                                <span className="text-[10px] bg-blue-50 text-[#2271b1] border border-blue-200 px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
                                  🔗 {hub.link}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newHubs = currentHubs.filter((_: any, i: number) => i !== hIdx);
                                updateSection("serviceArea", "hubs", newHubs);
                              }}
                              className="text-[#d63638] hover:opacity-80 p-1 flex items-center gap-1 text-xs font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-[#50575e]">Country / State Name</label>
                              <input
                                list={`service-countries-list-${hIdx}`}
                                type="text"
                                value={hub.name || ""}
                                onChange={(e) => {
                                  const countryVal = e.target.value;
                                  const newHubs = [...currentHubs];
                                  const autoGeo = resolveCountryLocation(countryVal);
                                  newHubs[hIdx] = {
                                    ...newHubs[hIdx],
                                    name: countryVal,
                                    timezone: newHubs[hIdx].timezone || autoGeo.timezone
                                  };
                                  updateSection("serviceArea", "hubs", newHubs);
                                }}
                                className={UI.input + " font-bold"}
                                placeholder="e.g. United States or Germany"
                              />
                              <datalist id={`service-countries-list-${hIdx}`}>
                                {AVAILABLE_COUNTRIES.map((c) => (
                                  <option key={c} value={c} />
                                ))}
                              </datalist>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-[#50575e]">Specialty / Focus</label>
                              <input
                                type="text"
                                value={hub.focus || ""}
                                onChange={(e) => {
                                  const newHubs = [...currentHubs];
                                  newHubs[hIdx] = { ...newHubs[hIdx], focus: e.target.value };
                                  updateSection("serviceArea", "hubs", newHubs);
                                }}
                                className={UI.input}
                                placeholder="e.g. Architecture & Design"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-[#50575e]">Timezone Badge</label>
                              <input
                                type="text"
                                value={hub.timezone || geo.timezone || ""}
                                onChange={(e) => {
                                  const newHubs = [...currentHubs];
                                  newHubs[hIdx] = { ...newHubs[hIdx], timezone: e.target.value };
                                  updateSection("serviceArea", "hubs", newHubs);
                                }}
                                className={UI.input + " font-mono"}
                                placeholder="e.g. PST, EST, GMT, CET"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-[#50575e]">Navigation Link (URL)</label>
                              <input
                                type="text"
                                value={hub.link || ""}
                                onChange={(e) => {
                                  const newHubs = [...currentHubs];
                                  newHubs[hIdx] = { ...newHubs[hIdx], link: e.target.value };
                                  updateSection("serviceArea", "hubs", newHubs);
                                }}
                                className={UI.input}
                                placeholder="e.g. /locations"
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

            {/* 13. FAQS */}
            {activeTab === "faqs" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className={UI.sectionHeader}>Service Specific FAQs</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const current = Array.isArray(data.faqs) ? data.faqs : [];
                      updateRootField("faqs", [
                        ...current,
                        { q: "New Question?", a: "Detailed answer." }
                      ]);
                    }}
                    className={UI.buttonAdd}
                  >
                    <Plus className="w-3 h-3" /> Add FAQ
                  </button>
                </div>

                <div className="space-y-4">
                  {(Array.isArray(data.faqs) ? data.faqs : []).map((faq: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-3"}>
                      <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">FAQ #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (data.faqs || []).filter((_: any, i: number) => i !== idx);
                            updateRootField("faqs", list);
                          }}
                          className="text-[#d63638] hover:text-[#b32d2e] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Question</label>
                        <input
                          type="text"
                          value={faq.q || faq.question || ""}
                          onChange={(e) => {
                            const list = [...(data.faqs || [])];
                            list[idx] = { ...list[idx], q: e.target.value, question: e.target.value };
                            updateRootField("faqs", list);
                          }}
                          className={UI.input + " font-bold"}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Answer</label>
                        <textarea
                          rows={3}
                          value={faq.a || faq.answer || ""}
                          onChange={(e) => {
                            const list = [...(data.faqs || [])];
                            list[idx] = { ...list[idx], a: e.target.value, answer: e.target.value };
                            updateRootField("faqs", list);
                          }}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 15. FINAL CTA BANNER */}
            {activeTab === "finalCta" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>High-Conversion CTA Banner</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={data.finalCta?.eyebrow || "READY TO ACCELERATE?"}
                    onChange={(e) => updateSection("finalCta", "eyebrow", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={data.finalCta?.titleIntro || "Let's Build Your Next"}
                      onChange={(e) => updateSection("finalCta", "titleIntro", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={data.finalCta?.titleHighlight || "Competitive Edge"}
                      onChange={(e) => updateSection("finalCta", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Title Line 2 (Optional — Leave blank to hide)</label>
                  <input
                    type="text"
                    value={data.finalCta?.titleLine2 || ""}
                    onChange={(e) => updateSection("finalCta", "titleLine2", e.target.value)}
                    className={UI.input}
                    placeholder="e.g. Together. (Leave blank to hide)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <textarea
                    rows={2}
                    value={data.finalCta?.description !== undefined ? data.finalCta.description : "Schedule a free strategic consultation. We will audit your existing presence and map out a concrete blueprint for scalable growth."}
                    onChange={(e) => updateSection("finalCta", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Primary Button Text</label>
                    <input
                      type="text"
                      value={data.finalCta?.primaryCtaText !== undefined ? data.finalCta.primaryCtaText : (data.finalCta?.primaryCta?.text || "Schedule Discovery Session")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData((prev: any) => {
                          const fc = prev?.finalCta || {};
                          return {
                            ...prev,
                            finalCta: {
                              ...fc,
                              primaryCtaText: val,
                              primaryCta: { ...(fc.primaryCta || {}), text: val }
                            }
                          };
                        });
                      }}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Primary Button Link</label>
                    <input
                      type="text"
                      value={data.finalCta?.primaryCtaLink !== undefined ? data.finalCta.primaryCtaLink : (data.finalCta?.primaryCta?.link || "#contact-form")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData((prev: any) => {
                          const fc = prev?.finalCta || {};
                          return {
                            ...prev,
                            finalCta: {
                              ...fc,
                              primaryCtaLink: val,
                              primaryCta: { ...(fc.primaryCta || {}), link: val }
                            }
                          };
                        });
                      }}
                      className={UI.input}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Secondary Button Text (Optional — Leave blank to hide)</label>
                    <input
                      type="text"
                      value={data.finalCta?.secondaryCtaText !== undefined ? data.finalCta.secondaryCtaText : (data.finalCta?.secondaryCta?.text || "Contact Office")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData((prev: any) => {
                          const fc = prev?.finalCta || {};
                          return {
                            ...prev,
                            finalCta: {
                              ...fc,
                              secondaryCtaText: val,
                              secondaryCta: { ...(fc.secondaryCta || {}), text: val }
                            }
                          };
                        });
                      }}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Secondary Button Link</label>
                    <input
                      type="text"
                      value={data.finalCta?.secondaryCtaLink !== undefined ? data.finalCta.secondaryCtaLink : (data.finalCta?.secondaryCta?.link || "/contact")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData((prev: any) => {
                          const fc = prev?.finalCta || {};
                          return {
                            ...prev,
                            finalCta: {
                              ...fc,
                              secondaryCtaLink: val,
                              secondaryCta: { ...(fc.secondaryCta || {}), link: val }
                            }
                          };
                        });
                      }}
                      className={UI.input}
                    />
                  </div>
                </div>

                <ImageField
                  label="Founder Portrait Artwork"
                  value={data.finalCta?.founderImage || data.finalCta?.image || data.finalCta?.backgroundImage || data.finalCta?.bgImage || "/founder_portrait_nobg.png"}
                  onChange={(url) => {
                    setData((prev: any) => {
                      const fc = prev?.finalCta || {};
                      return {
                        ...prev,
                        finalCta: {
                          ...fc,
                          founderImage: url,
                          image: url,
                          backgroundImage: url,
                          bgImage: url
                        }
                      };
                    });
                  }}
                />
              </div>
            )}

            {/* 15. RELATED BLOG INSIGHTS */}
            {activeTab === "blogSection" && (
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>Recommended Services Header</h3>
                <p className="text-[11px] text-[#646970] -mt-4">Customize the heading area. Service cards are auto-populated.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Section Eyebrow</label>
                    <input
                      type="text"
                      value={data.recommendedSection?.eyebrow || "11 // RECOMMENDATION"}
                      onChange={(e) => updateSection("recommendedSection", "eyebrow", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight (Italic)</label>
                    <input
                      type="text"
                      value={data.recommendedSection?.titleHighlight || "Perfect Together"}
                      onChange={(e) => updateSection("recommendedSection", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Title Intro</label>
                  <input
                    type="text"
                    value={data.recommendedSection?.titleIntro || "Services That Pair"}
                    onChange={(e) => updateSection("recommendedSection", "titleIntro", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Section Description</label>
                  <textarea
                    rows={2}
                    value={data.recommendedSection?.description || ""}
                    onChange={(e) => updateSection("recommendedSection", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="pt-6 mt-2 border-t-2 border-[#2271b1]/20" />
                <h3 className={UI.sectionHeader}>Related Blog Insights</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Section Badge</label>
                  <input
                    type="text"
                    value={data.blogSection?.subtitle || "LATEST ARTICLES & INSIGHTS"}
                    onChange={(e) => updateSection("blogSection", "subtitle", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Section Title</label>
                  <input
                    type="text"
                    value={data.blogSection?.title || "Related Engineering Insights"}
                    onChange={(e) => updateSection("blogSection", "title", e.target.value)}
                    className={UI.input}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <textarea
                    rows={2}
                    value={data.blogSection?.description || ""}
                    onChange={(e) => updateSection("blogSection", "description", e.target.value)}
                    className={UI.input}
                  />
                </div>

                <div className="space-y-2 pt-4 border-t border-[#f0f0f1]">
                  <label className={UI.label}>Select Related Articles</label>
                  <BlogSelector
                    selectedIds={data.blogSection?.selectedPosts || []}
                    onChange={(posts) => updateSection("blogSection", "selectedPosts", posts)}
                  />
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
