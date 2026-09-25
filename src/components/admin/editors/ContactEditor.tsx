"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, Type, Image as ImageIcon,
  Phone, Plus, Trash2, Mail,
  MapPin, Clock, Send, Sparkles, MessageSquare,
  Calendar, Globe, Shield, Award, Star, Building2,
  Building, Target, Box, Zap
} from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import IconSelector from "@/components/admin/IconSelector";
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import { parseMapEmbed } from "@/lib/mapEmbed";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

function BulletListEditor({
  label,
  items,
  onChange,
  placeholder = "Enter item..."
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const currentItems = Array.isArray(items) ? items : (items ? [items] : []);

  return (
    <div className="space-y-2 bg-[#f8f9fa] border border-[#dcdcde] p-3 rounded-[4px]">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#50575e]">{label}</label>
        <button
          type="button"
          onClick={() => onChange([...currentItems, ""])}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2271b1] hover:text-[#135e96] hover:underline"
        >
          + Add Option
        </button>
      </div>

      <div className="space-y-1.5">
        {currentItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-[#8c8f94] w-5 text-right shrink-0">{idx + 1}.</span>
            <input
              type="text"
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const updated = [...currentItems];
                updated[idx] = e.target.value;
                onChange(updated);
              }}
              className="flex-1 border border-[#8c8f94] px-2.5 py-1 text-xs rounded-[3px] bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const updated = currentItems.filter((_, i) => i !== idx);
                onChange(updated);
              }}
              className="text-[#d63638] hover:text-red-700 p-1 text-xs font-bold shrink-0"
              title="Delete this item"
            >
              ✕
            </button>
          </div>
        ))}
        {currentItems.length === 0 && (
          <div className="text-[11px] text-[#8c8f94] italic py-1">
            No items yet. Click <span className="font-bold text-[#2271b1] cursor-pointer" onClick={() => onChange([""])}>+ Add Option</span> to add services.
          </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_CONTACT_DATA = {
  hero: {
    eyebrow: "DIRECT CHANNEL // FAST RESPONSE",
    titleLine1: "Let's Engineer Your",
    titleLine2: "Next Big",
    titleHighlight: "Advantage.",
    description: "Whether you need a full platform build, conversion optimization, or technical advisory, we're here to accelerate your vision.",
    // No default image: /portfolio_hero_bg.png does not exist in /public (it 404'd). Pick one with the image field.
    backgroundImage: "",
    bgImage: "",
    form: {
      title: "Send Us a Message",
      submitButton: "Send Message & Request Proposal",
      guaranteeText: "⚡ Guaranteed response within 24 hours. Strict NDA & privacy assured.",
      namePlaceholder: "Full Name *",
      emailPlaceholder: "Email Address *",
      phonePlaceholder: "Phone Number",
      companyPlaceholder: "Company (Optional)",
      servicePlaceholder: "Select a service",
      messagePlaceholder: "Tell us about your project *",
      privacyText: "I agree to the",
      privacyLinkText: "Privacy Policy",
      privacyHref: "/privacy",
      successTitle: "Message Sent Successfully!",
      successMessage: "Thank you for reaching out. Our team will review your inquiry and get back to you within 24 hours.",
      // Real, selectable options only - the "Select a service" placeholder is its own field above.
      services: [
        "Custom Next.js & React Platform",
        "Conversion Rate Optimization (CRO)",
        "Full-Funnel Growth Marketing",
        "UI/UX Design & Brand System",
        "Technical Architecture Audit",
        "General Consultation"
      ]
    }
  },
  contactMethods: {
    eyebrow: "COMMUNICATION CHANNELS",
    title: "Other Ways to Connect",
    methods: [
      {
        id: "phone",
        icon: "Phone",
        title: "Direct Phone",
        info: "+1 (555) 019-2834",
        sub: "Mon-Fri: 9am-6pm EST",
        actionHref: "tel:+15550192834"
      },
      {
        id: "email",
        icon: "Mail",
        title: "Direct Email",
        info: "hello@mohsindesigns.com",
        sub: "Response within 24h",
        actionHref: "mailto:hello@mohsindesigns.com"
      },
      {
        id: "chat",
        icon: "MessageSquare",
        title: "Live WhatsApp",
        info: "Direct WhatsApp Line",
        sub: "Fastest response channel",
        actionHref: "https://wa.me/15550192834"
      },
      {
        id: "calendar",
        icon: "Calendar",
        title: "Schedule Call",
        info: "Book 30-Min Strategy Call",
        sub: "Instant calendar confirmation",
        actionHref: "#contact-form"
      }
    ]
  },
  office: {
    title: "OUR HEADQUARTERS",
    addressLine1: "1540 Broadway, 24th Floor",
    addressLine2: "Times Square, New York, NY 10036",
    country: "United States",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.217709322237!2d-73.98785312342557!3d40.75797477138596!2m3!1f0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus",
    mapBadge: "New York Office",
    hoursWeekdays: "Monday – Friday: 9:00 AM – 6:00 PM EST",
    hoursWeekends: "Saturday – Sunday: By Appointment",
    phone: "+1 (555) 019-2834",
    email: "hello@mohsindesigns.com"
  },
  ctaBanner: {
    eyebrow: "READY TO ACCELERATE?",
    titleIntro: "Let's Build Your Next",
    titleHighlight: "Competitive Edge",
    titleLine2: "Together.",
    description: "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: { label: "Book Strategy Session", href: "#contact-form" },
    ctaSecondary: { label: "Direct Office Line", href: "tel:+15550192834" },
    // No default image: /founder.png does not exist in /public (it 404'd). Pick one with the image field.
    portraitSrc: "",
    portraitAlt: "Mohsin Designs Lead Architect"
  },
  // Blank = use the site-wide address from Settings > Contact (see /api/send). It must NOT default to a
  // real address here: a persisted default would silently override the Settings value on every save.
  receiverEmail: ""
};

// Saved contactPage + defaults for every key the editor shows. Applied to the LATEST state inside the
// setData updater (not to the render-time snapshot) so rapid edits / async rich-text onChange never
// overwrite each other.
const withDefaults = (cp: any) => ({
  ...DEFAULT_CONTACT_DATA,
  ...(cp || {}),
  hero: { ...DEFAULT_CONTACT_DATA.hero, ...(cp?.hero || {}), form: { ...DEFAULT_CONTACT_DATA.hero.form, ...(cp?.hero?.form || {}) } },
  contactMethods: { ...DEFAULT_CONTACT_DATA.contactMethods, ...(cp?.contactMethods || {}) },
  office: { ...DEFAULT_CONTACT_DATA.office, ...(cp?.office || {}) },
  ctaBanner: { ...DEFAULT_CONTACT_DATA.ctaBanner, ...(cp?.ctaBanner || {}) }
});

export default function ContactEditor({ pageId, data, setData, seo, setSeo }: { pageId: string, data: any, setData: (d: any) => void, seo?: any, setSeo?: (s: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  // Ensure contactPage has complete structure
  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || !data.contactPage) {
      setData((prev: any) => ({
        ...(prev || {}),
        contactPage: {
          ...DEFAULT_CONTACT_DATA,
          ...(prev?.contactPage || {})
        }
      }));
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const contact = withDefaults(data.contactPage);

  const updateContact = (updater: (prev: typeof contact) => typeof contact) => {
    setData((prev: any) => ({
      ...(prev || {}),
      contactPage: updater(withDefaults(prev?.contactPage))
    }));
  };

  // Method-card edits always start from the latest saved list (never a stale render-time copy)
  const updateMethods = (fn: (methods: any[]) => any[]) =>
    updateContact(prev => ({
      ...prev,
      contactMethods: { ...prev.contactMethods, methods: fn(Array.isArray(prev.contactMethods.methods) ? prev.contactMethods.methods : []) }
    }));
  const patchMethod = (idx: number, patch: Record<string, any>) =>
    updateMethods(list => list.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  const moveMethod = (idx: number, dir: -1 | 1) =>
    updateMethods(list => {
      const j = idx + dir;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  // Shared text-field patcher for the new "form labels" inputs
  const patchForm = (patch: Record<string, any>) =>
    updateContact(prev => ({ ...prev, hero: { ...prev.hero, form: { ...prev.hero.form, ...patch } } }));

  const mapPreview = parseMapEmbed(contact.office.mapEmbedUrl);

  const tabs = [
    { id: "hero", label: "01. Hero & Form Header", icon: Type },
    { id: "methods", label: "02. Connect Channels (4 Cards)", icon: Phone },
    { id: "office", label: "03. Interactive Map & Office", icon: MapPin },
    { id: "cta", label: "04. Conversion CTA Banner", icon: Sparkles },
    { id: "notifications", label: "05. Notifications & Email", icon: Mail },
    { id: "schema", label: "06. Schema Markup", icon: Box },
  ];

  return (
    <div className="bg-white">
      {/* WordPress Sub-tabs Bar */}
      <div className="flex overflow-x-auto border-b border-[#c3c4c7] bg-[#f0f0f1] no-scrollbar mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 text-[12px] font-medium border-r border-[#dcdcde] whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === tab.id
                ? "bg-white text-[#1d2327] font-bold border-b-2 border-b-[#2271b1] -mb-[1px] shadow-sm"
                : "text-[#50575e] hover:bg-white/60 hover:text-[#1d2327]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* ── TAB 1: HERO & FORM HEADER ── */}
        {activeTab === "hero" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">Hero & Form Visibility</h2>
                <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
              </div>
              <SectionToggle
                enabled={contact.hero?.enabled !== false}
                onChange={(v) => updateContact(prev => ({ ...prev, hero: { ...prev.hero, enabled: v } }))}
                label="Hero & Form"
              />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Hero Headline & Brand Narrative</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Eyebrow Badge Text</label>
                  <input
                    type="text"
                    value={contact.hero.eyebrow}
                    onChange={(e) => updateContact(prev => ({ ...prev, hero: { ...prev.hero, eyebrow: e.target.value } }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="DIRECT CHANNEL // FAST RESPONSE"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Title Line 1</label>
                  <input
                    type="text"
                    value={contact.hero.titleLine1}
                    onChange={(e) => updateContact(prev => ({ ...prev, hero: { ...prev.hero, titleLine1: e.target.value } }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Let's Engineer Your"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Title Line 2 (Before Highlight)</label>
                  <input
                    type="text"
                    value={contact.hero.titleLine2}
                    onChange={(e) => updateContact(prev => ({ ...prev, hero: { ...prev.hero, titleLine2: e.target.value } }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Next Big"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2271b1]">Title Highlight (Underlined Word)</label>
                  <input
                    type="text"
                    value={contact.hero.titleHighlight}
                    onChange={(e) => updateContact(prev => ({ ...prev, hero: { ...prev.hero, titleHighlight: e.target.value } }))}
                    className="w-full border border-[#2271b1] px-2.5 py-1.5 text-xs rounded-[3px] bg-white font-bold"
                    placeholder="Advantage."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Hero Subtitle Description</label>
                <RichTextEditor
                  content={contact.hero.description || ""}
                  onChange={(val: string) => updateContact(prev => ({ ...prev, hero: { ...prev.hero, description: val } }))}
                  placeholder="Describe your fast inquiry process..."
                />
              </div>

              <div className="pt-2 border-t border-[#dcdcde]">
                <ImageField
                  label="Hero Background Bleed Image Banner"
                  value={contact.hero.backgroundImage || contact.hero.bgImage || ""}
                  onChange={(url) => updateContact(prev => ({
                    ...prev,
                    hero: { ...prev.hero, backgroundImage: url, bgImage: url }
                  }))}
                />
              </div>
            </div>

            {/* Right Card Settings */}
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Glass Contact Form Configuration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Form Card Heading</label>
                  <input
                    type="text"
                    value={contact.hero.form.title}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      hero: { ...prev.hero, form: { ...prev.hero.form, title: e.target.value } }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Send Us a Message"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Submit Button Text</label>
                  <input
                    type="text"
                    value={contact.hero.form.submitButton}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      hero: { ...prev.hero, form: { ...prev.hero.form, submitButton: e.target.value } }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Send Message & Request Proposal"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Guarantee Subtext Footer</label>
                <input
                  type="text"
                  value={contact.hero.form.guaranteeText}
                  onChange={(e) => updateContact(prev => ({
                    ...prev,
                    hero: { ...prev.hero, form: { ...prev.hero.form, guaranteeText: e.target.value } }
                  }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="⚡ Guaranteed response within 24 hours. Strict NDA & privacy assured."
                />
              </div>

              {/* Service Dropdown Options List */}
              <div className="pt-2 space-y-2">
                <BulletListEditor
                  label="Dropdown Service Options"
                  items={contact.hero.form.services || []}
                  onChange={(srv) => patchForm({ services: srv })}
                  placeholder="e.g. Custom Next.js Platform"
                />
                <p className="text-[11px] text-[#646970]">
                  Every entry is a selectable choice. The visitor's pick is stored with the lead and included in the notification email.
                  Leave the list empty to hide the dropdown. (Older pages may still list "Select a service" first - it is treated as the placeholder text.)
                </p>
              </div>
            </div>

            {/* Form labels, placeholders & messages (all of these used to be hard-coded in the page) */}
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Form Field Text & Confirmation Message</h3>
              <p className="text-[11px] text-[#646970]">
                Placeholder text shown inside each field (add a trailing * to mark required fields). Clearing a field falls back to a sensible label.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["namePlaceholder", "Full Name field", "Full Name *"],
                  ["emailPlaceholder", "Email field", "Email Address *"],
                  ["phonePlaceholder", "Phone field", "Phone Number"],
                  ["companyPlaceholder", "Company field", "Company (Optional)"],
                  ["servicePlaceholder", "Service dropdown (before a choice is made)", "Select a service"],
                  ["messagePlaceholder", "Message box", "Tell us about your project *"],
                ] as const).map(([key, label, ph]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[11px] font-bold text-[#50575e]">{label}</label>
                    <input
                      type="text"
                      value={contact.hero.form[key] ?? ""}
                      onChange={(e) => patchForm({ [key]: e.target.value })}
                      className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                      placeholder={ph}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#dcdcde]">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Privacy checkbox text</label>
                  <input
                    type="text"
                    value={contact.hero.form.privacyText ?? ""}
                    onChange={(e) => patchForm({ privacyText: e.target.value })}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="I agree to the"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Privacy link text</label>
                  <input
                    type="text"
                    value={contact.hero.form.privacyLinkText ?? ""}
                    onChange={(e) => patchForm({ privacyLinkText: e.target.value })}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Privacy Policy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Privacy link URL</label>
                  <input
                    type="text"
                    value={contact.hero.form.privacyHref ?? ""}
                    onChange={(e) => patchForm({ privacyHref: e.target.value })}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white font-mono text-[11px]"
                    placeholder="/privacy"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#dcdcde]">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Success title (shown after the message is sent)</label>
                  <input
                    type="text"
                    value={contact.hero.form.successTitle ?? ""}
                    onChange={(e) => patchForm({ successTitle: e.target.value })}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Message Sent Successfully!"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Success message</label>
                  <textarea
                    rows={2}
                    value={contact.hero.form.successMessage ?? ""}
                    onChange={(e) => patchForm({ successMessage: e.target.value })}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Thank you for reaching out. Our team will review your inquiry and get back to you within 24 hours."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: CONNECT CHANNELS (4 CARDS) ── */}
        {activeTab === "methods" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">Connect Channels Visibility</h2>
                <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
              </div>
              <SectionToggle
                enabled={contact.contactMethods?.enabled !== false}
                onChange={(v) => updateContact(prev => ({ ...prev, contactMethods: { ...prev.contactMethods, enabled: v } }))}
                label="Connect Channels"
              />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Section Header</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Section Eyebrow</label>
                  <input
                    type="text"
                    value={contact.contactMethods.eyebrow}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      contactMethods: { ...prev.contactMethods, eyebrow: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="COMMUNICATION CHANNELS"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Section Title</label>
                  <input
                    type="text"
                    value={contact.contactMethods.title}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      contactMethods: { ...prev.contactMethods, title: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Other Ways to Connect"
                  />
                </div>
              </div>
            </div>

            {/* Methods Cards List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Contact Method Cards</h3>
                <button
                  type="button"
                  onClick={() => updateMethods(list => [
                    ...list,
                    {
                      id: `method_${Date.now()}`,
                      icon: "Phone",
                      title: "New Channel",
                      info: "+1 (555) 000-0000",
                      sub: "Available 24/7",
                      actionHref: "tel:+15550000000"
                    }
                  ])}
                  className="text-xs font-bold text-[#2271b1] hover:underline"
                >
                  + Add Channel Card
                </button>
              </div>

              {(contact.contactMethods.methods || []).length === 0 && (
                <div className="border border-dashed border-[#c3c4c7] bg-white rounded-[4px] p-4 text-xs text-[#646970]">
                  No cards - this section is hidden on the live page. Click <strong>+ Add Channel Card</strong> to show it again.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(contact.contactMethods.methods || []).map((method: any, idx: number, all: any[]) => (
                  <div key={`${method.id || "method"}-${idx}`} className="bg-white border border-[#c3c4c7] p-4 rounded-[4px] shadow-sm space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                      <span className="text-xs font-bold text-[#1d2327]">Card #{idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => moveMethod(idx, -1)}
                          disabled={idx === 0}
                          className="text-[#2271b1] hover:text-[#135e96] text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move card earlier"
                          aria-label={`Move card ${idx + 1} earlier`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMethod(idx, 1)}
                          disabled={idx === all.length - 1}
                          className="text-[#2271b1] hover:text-[#135e96] text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move card later"
                          aria-label={`Move card ${idx + 1} later`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMethods(list => list.filter((_, i) => i !== idx))}
                          className="text-[#d63638] hover:text-red-700 text-xs font-bold"
                          title="Delete Card"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#50575e]">Card Icon</label>
                        <div>
                          <IconSelector
                            value={method.icon || "Phone"}
                            onChange={(icon) => patchMethod(idx, { icon })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#50575e]">Card Title</label>
                        <input
                          type="text"
                          value={method.title ?? ""}
                          onChange={(e) => patchMethod(idx, { title: e.target.value })}
                          className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                          placeholder="Direct Phone"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#50575e]">Main Info Text</label>
                        <input
                          type="text"
                          value={method.info ?? ""}
                          onChange={(e) => patchMethod(idx, { info: e.target.value })}
                          className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                          placeholder="+1 (555) 019-2834"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#50575e]">Subtext (Availability)</label>
                        <input
                          type="text"
                          value={method.sub ?? ""}
                          onChange={(e) => patchMethod(idx, { sub: e.target.value })}
                          className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                          placeholder="Mon-Fri: 9am-6pm EST"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#50575e]">Action Link / Href</label>
                      <input
                        type="text"
                        value={method.actionHref ?? ""}
                        onChange={(e) => patchMethod(idx, { actionHref: e.target.value })}
                        className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[11px]"
                        placeholder="tel:+15550192834 or mailto:hello@... or https://wa.me/..."
                      />
                      <p className="text-[10px] text-[#646970]">
                        Use <code>#contact-form</code> to scroll to the form. Leave blank for a card that is not clickable.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: INTERACTIVE MAP & OFFICE ── */}
        {activeTab === "office" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">Interactive Map & Office Visibility</h2>
                <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
              </div>
              <SectionToggle
                enabled={contact.office?.enabled !== false}
                onChange={(v) => updateContact(prev => ({ ...prev, office: { ...prev.office, enabled: v } }))}
                label="Map & Office"
              />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Google Map Embed Settings</h3>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Map Embed (URL, iframe code, or just an address)</label>
                <input
                  type="text"
                  value={contact.office.mapEmbedUrl}
                  onChange={(e) => updateContact(prev => ({
                    ...prev,
                    office: { ...prev.office, mapEmbedUrl: e.target.value }
                  }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white font-mono text-[11px]"
                  placeholder="https://www.google.com/maps/embed?... or 1540 Broadway, New York"
                />
                <p className="text-[11px] text-[#646970]">
                  Tip: On Google Maps, click <strong>Share</strong> &gt; <strong>Embed a map</strong> &gt; copy the <code>src="..."</code> URL (pasting the whole iframe code also works).
                  Only Google, OpenStreetMap, Bing, Mapbox, ArcGIS and MapQuest embeds are shown. Leave blank to hide the map.
                </p>
                {String(contact.office.mapEmbedUrl || "").trim() !== "" && (
                  mapPreview ? (
                    <p className="text-[11px] font-bold text-[#00a32a]">Map will be shown on the page.</p>
                  ) : (
                    <p className="text-[11px] font-bold text-[#d63638]">This is not an allowed map embed - the map will NOT be shown. Paste the embed URL from your map provider, or an address.</p>
                  )
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Floating Map Pin Badge Text (top-left of the map; blank = no badge)</label>
                <input
                  type="text"
                  value={contact.office.mapBadge}
                  onChange={(e) => updateContact(prev => ({
                    ...prev,
                    office: { ...prev.office, mapBadge: e.target.value }
                  }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="New York Office"
                />
              </div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Headquarters & Operating Hours</h3>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Office Title / Eyebrow</label>
                <input
                  type="text"
                  value={contact.office.title}
                  onChange={(e) => updateContact(prev => ({
                    ...prev,
                    office: { ...prev.office, title: e.target.value }
                  }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="OUR HEADQUARTERS"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Address Line 1 (Street & Floor)</label>
                  <input
                    type="text"
                    value={contact.office.addressLine1}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      office: { ...prev.office, addressLine1: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="1540 Broadway, 24th Floor"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Address Line 2 (City, State, Zip)</label>
                  <input
                    type="text"
                    value={contact.office.addressLine2}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      office: { ...prev.office, addressLine2: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Times Square, New York, NY 10036"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Country</label>
                  <input
                    type="text"
                    value={contact.office.country}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      office: { ...prev.office, country: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="United States"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Direct Office Phone</label>
                  <input
                    type="text"
                    value={contact.office.phone}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      office: { ...prev.office, phone: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Public Contact Email (shown on the page)</label>
                  <input
                    type="text"
                    value={contact.office.email}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      office: { ...prev.office, email: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="hello@mohsindesigns.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Weekday Hours</label>
                  <input
                    type="text"
                    value={contact.office.hoursWeekdays}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      office: { ...prev.office, hoursWeekdays: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Monday – Friday: 9:00 AM – 6:00 PM EST"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Weekend Hours</label>
                  <input
                    type="text"
                    value={contact.office.hoursWeekends}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      office: { ...prev.office, hoursWeekends: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Saturday – Sunday: By Appointment"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: BOTTOM CONVERSION CTA BANNER ── */}
        {activeTab === "cta" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">Conversion CTA Banner Visibility</h2>
                <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
              </div>
              <SectionToggle
                enabled={contact.ctaBanner?.enabled !== false}
                onChange={(v) => updateContact(prev => ({ ...prev, ctaBanner: { ...prev.ctaBanner, enabled: v } }))}
                label="CTA Banner"
              />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Signature Agency CTA Banner</h3>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Eyebrow Badge Pill</label>
                <input
                  type="text"
                  value={contact.ctaBanner.eyebrow}
                  onChange={(e) => updateContact(prev => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, eyebrow: e.target.value }
                  }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="READY TO ACCELERATE?"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Title Intro (Line 1)</label>
                  <input
                    type="text"
                    value={contact.ctaBanner.titleIntro}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, titleIntro: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Let's Build Your Next"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2271b1]">Title Highlight (Cursive Yellow)</label>
                  <input
                    type="text"
                    value={contact.ctaBanner.titleHighlight}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, titleHighlight: e.target.value }
                    }))}
                    className="w-full border border-[#2271b1] px-2.5 py-1.5 text-xs rounded-[3px] bg-white font-bold"
                    placeholder="Competitive Edge"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Title Line 2</label>
                  <input
                    type="text"
                    value={contact.ctaBanner.titleLine2}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, titleLine2: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Together."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Banner Description</label>
                <RichTextEditor
                  content={contact.ctaBanner.description || ""}
                  onChange={(val: string) => updateContact(prev => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, description: val }
                  }))}
                  placeholder="Schedule a free 30-minute technical audit..."
                />
              </div>

              {/* Dual CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#dcdcde]">
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Primary Button (Yellow)</h4>
                  <p className="text-[10px] text-[#646970]">A button shows only when it has both a label and a working link.</p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Label</label>
                    <input
                      type="text"
                      value={contact.ctaBanner.ctaPrimary?.label || ""}
                      onChange={(e) => updateContact(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaPrimary: { ...prev.ctaBanner.ctaPrimary, label: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                      placeholder="Book Strategy Session"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Link / Anchor</label>
                    <input
                      type="text"
                      value={contact.ctaBanner.ctaPrimary?.href || ""}
                      onChange={(e) => updateContact(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaPrimary: { ...prev.ctaBanner.ctaPrimary, href: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[11px]"
                      placeholder="#contact-form"
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Secondary Button (White Outline)</h4>
                  <p className="text-[10px] text-[#646970]">Leave the label or link blank to hide this button.</p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Label</label>
                    <input
                      type="text"
                      value={contact.ctaBanner.ctaSecondary?.label || ""}
                      onChange={(e) => updateContact(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaSecondary: { ...prev.ctaBanner.ctaSecondary, label: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                      placeholder="Direct Office Line"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Link / Anchor</label>
                    <input
                      type="text"
                      value={contact.ctaBanner.ctaSecondary?.href || ""}
                      onChange={(e) => updateContact(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaSecondary: { ...prev.ctaBanner.ctaSecondary, href: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[11px]"
                      placeholder="tel:+15550192834"
                    />
                  </div>
                </div>
              </div>

              {/* Portrait Image */}
              <div className="pt-3 border-t border-[#dcdcde] space-y-3">
                <ImageField
                  label="Portrait Image (Arch Shape Graphics)"
                  value={contact.ctaBanner.portraitSrc || ""}
                  onChange={(url) => updateContact(prev => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, portraitSrc: url }
                  }))}
                />
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Portrait Alt Text</label>
                  <input
                    type="text"
                    value={contact.ctaBanner.portraitAlt || ""}
                    onChange={(e) => updateContact(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, portraitAlt: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Mohsin Designs Lead Architect"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: NOTIFICATIONS & EMAIL ── */}
        {activeTab === "notifications" && (
          <div className="space-y-5">
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Form Submission Notifications</h3>
              <p className="text-[12px] text-[#646970]">
                Enter the email address that receives enquiries sent through the contact forms (this page and the homepage contact section).
                Every enquiry is also saved under <strong>Leads &amp; Inquiries</strong> in the admin.
              </p>

              <div className="space-y-1 max-w-md">
                <label className="text-[11px] font-bold text-[#50575e]">Notification Receiver Email</label>
                <input
                  type="email"
                  value={contact.receiverEmail || ""}
                  onChange={(e) => updateContact(prev => ({ ...prev, receiverEmail: e.target.value }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="Leave blank to use the address from Settings > Contact"
                />
                {String(contact.receiverEmail || "").trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(contact.receiverEmail).trim()) && (
                  <p className="text-[11px] font-bold text-[#d63638]">This does not look like a valid email address - notifications would fall back to the Settings address.</p>
                )}
                <p className="text-[11px] text-[#646970]">
                  Quote requests, job applications, consultation forms and the newsletter box always use the address in <strong>Settings &gt; Contact &gt; Notification Receiver Email</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: SCHEMA MARKUP ── */}
        {activeTab === "schema" && (
          <div className="space-y-4">
            {/* Same wiring as the page's own Schema tab: page-level seo.schemaData wins on the live page
                (lib/dynamicSchema), so it MUST be updated too or an edit here would be silently shadowed. */}
            <SchemaEditor
              value={seo?.schemaData || data.schemaMarkup || data.seo?.schemaData || ""}
              onChange={(val) => {
                if (setSeo) setSeo({ ...(seo || {}), schemaData: val });
                setData((prev: any) => ({
                  ...(prev || {}),
                  schemaMarkup: val
                }));
              }}
              pageTitle="Contact Us"
            />
          </div>
        )}
      </div>
    </div>
  );
}
