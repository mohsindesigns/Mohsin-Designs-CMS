"use client";

import React, { useState, useId } from "react";
import { Code2, CheckCircle2, AlertTriangle, Sparkles, Copy, Trash2, AlignLeft, Info } from "lucide-react";

interface SchemaEditorProps {
  value: string;
  onChange: (val: string) => void;
  pageTitle?: string;
  pageSlug?: string;
  className?: string;
  title?: string;
  description?: string;
}

const SCHEMA_SNIPPETS = [
  {
    label: "LocalBusiness",
    desc: "Physical or local commercial entity",
    snippet: `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "image": "https://example.com/logo.png",
  "telephone": "+1-000-000-0000",
  "email": "info@example.com",
  "url": "https://example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Street Address",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "00000",
    "addressCountry": "US"
  },
  "priceRange": "$$"
}`
  },
  {
    label: "Organization",
    desc: "Company, brand, agency, or corporation",
    snippet: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://facebook.com/yourbrand",
    "https://instagram.com/yourbrand",
    "https://linkedin.com/company/yourbrand"
  ]
}`
  },
  {
    label: "Service",
    desc: "Specific service offering page",
    snippet: `{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "serviceType": "Consulting & Implementation",
  "provider": {
    "@type": "Organization",
    "name": "Company Name",
    "url": "https://example.com"
  },
  "description": "Detailed description of the service offered.",
  "areaServed": "United States"
}`
  },
  {
    label: "WebPage",
    desc: "General web page metadata",
    snippet: `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Name",
  "description": "Short summary of this page for search engines.",
  "url": "https://example.com/page-slug"
}`
  },
  {
    label: "FAQPage",
    desc: "Frequently Asked Questions schema",
    snippet: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the timeline for completion?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Projects typically launch within 2 to 4 weeks."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide ongoing support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, monthly maintenance and support plans are available."
      }
    }
  ]
}`
  },
  {
    label: "Article / BlogPosting",
    desc: "Editorial or blog article",
    snippet: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Brief summary of the article.",
  "image": "https://example.com/featured-image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Company Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}`
  },
  {
    label: "Product",
    desc: "Commercial product or software solution",
    snippet: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "image": "https://example.com/product.jpg",
  "description": "Comprehensive product description.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "99.00",
    "availability": "https://schema.org/InStock"
  }
}`
  }
];

export default function SchemaEditor({
  value = "",
  onChange,
  pageTitle,
  pageSlug,
  className = "",
  title = "Custom Schema Markup (JSON-LD)",
  description = "Add your custom Schema.org structured data for this template or page. You can paste raw JSON or full <script type=\"application/ld+json\"> blocks. Leave empty to disable schema on this page."
}: SchemaEditorProps) {
  const [copied, setCopied] = useState(false);
  const snippetSelectId = useId();

  // Determine validation status
  const trimmed = (value || "").trim();
  let status: "empty" | "valid" | "script" | "invalid" = "empty";
  let parseError = "";

  if (trimmed) {
    if (trimmed.includes("<script")) {
      status = "script";
    } else {
      try {
        JSON.parse(trimmed);
        status = "valid";
      } catch (err: any) {
        status = "invalid";
        parseError = err?.message || "Invalid JSON syntax";
      }
    }
  }

  const handleFormat = () => {
    if (!trimmed) return;
    try {
      let textToFormat = trimmed;
      if (textToFormat.includes("<script")) {
        const match = textToFormat.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (match && match[1]) textToFormat = match[1].trim();
      }
      const parsed = JSON.parse(textToFormat);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      alert("Cannot format: The content contains invalid JSON syntax. Please correct syntax errors first.");
    }
  };

  const handleCopy = () => {
    if (!trimmed) return;
    navigator.clipboard.writeText(trimmed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (!trimmed) return;
    if (confirm("Are you sure you want to remove the custom schema markup for this page?")) {
      onChange("");
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    if (trimmed && !confirm("Replace current schema with this template?")) {
      return;
    }
    let filled = snippet;
    if (pageTitle) filled = filled.replace(/Business Name|Company Name|Page Name|Service Name|Article Title|Product Name/g, pageTitle);
    if (pageSlug) filled = filled.replace(/page-slug/g, pageSlug === "home" ? "" : pageSlug);
    onChange(filled);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f1] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#2271b1]" />
            <h3 className="text-[13px] font-bold text-[#1d2327] uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <p className="text-[12px] text-[#646970] mt-0.5 max-w-2xl">
            {description}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {status === "empty" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-medium bg-[#f0f0f1] text-[#646970]">
              <span className="w-2 h-2 rounded-full bg-[#8c8f94]" />
              No Schema Set (Clean)
            </span>
          )}
          {status === "valid" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Valid JSON-LD
            </span>
          )}
          {status === "script" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-medium bg-blue-50 border border-blue-200 text-blue-700">
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              HTML &lt;script&gt; Tag Detected
            </span>
          )}
          {status === "invalid" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-medium bg-amber-50 border border-amber-200 text-amber-700" title={parseError}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              JSON Syntax Warning
            </span>
          )}
        </div>
      </div>

      {/* Snippet Toolbar & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px]">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor={snippetSelectId} className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#2271b1]" /> Insert Starter Template:
          </label>
          <select
            id={snippetSelectId}
            aria-label="Insert Schema Template"
            onChange={(e) => {
              if (e.target.value) {
                const found = SCHEMA_SNIPPETS.find(s => s.label === e.target.value);
                if (found) handleInsertSnippet(found.snippet);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="border border-[#c3c4c7] bg-white text-[12px] px-2 py-1 rounded-[3px] text-[#2c3338] outline-none focus:border-[#2271b1]"
          >
            <option value="" disabled>Choose schema template...</option>
            {SCHEMA_SNIPPETS.map(s => (
              <option key={s.label} value={s.label}>
                {s.label} – {s.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {trimmed && (
            <>
              <button
                type="button"
                onClick={handleFormat}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#c3c4c7] hover:bg-[#f0f0f1] text-[#2c3338] text-[11px] font-semibold rounded-[3px] transition-colors"
                title="Auto-format and beautify JSON"
              >
                <AlignLeft className="w-3 h-3" /> Format JSON
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#c3c4c7] hover:bg-[#f0f0f1] text-[#2c3338] text-[11px] font-semibold rounded-[3px] transition-colors"
                title="Copy schema to clipboard"
              >
                <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#d63638] hover:bg-red-50 text-[#d63638] text-[11px] font-semibold rounded-[3px] transition-colors"
                title="Remove schema"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Box */}
      <div className="relative">
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full font-mono text-[12.5px] leading-relaxed p-3.5 bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-[4px] outline-none focus:ring-2 focus:ring-[#2271b1] focus:border-transparent transition-all selection:bg-[#45475a] resize-y"
          placeholder={`e.g.
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${pageTitle || "Page Title"}",
  "url": "https://mohsindesigns.com/${pageSlug || ""}"
}`}
        />
      </div>

      {/* Validation Message Box */}
      {status === "invalid" && parseError && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-[3px] text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Syntax Check:</span> {parseError}.
            <span className="text-amber-800 ml-1">Make sure quotes, commas, and braces are correctly closed.</span>
          </div>
        </div>
      )}

      {/* Help Tips */}
      <div className="flex items-start gap-2 text-[11px] text-[#646970] pt-1">
        <Info className="w-3.5 h-3.5 text-[#2271b1] shrink-0 mt-0.5" />
        <span>
          <strong>Pro-tip:</strong> You can test your output in Google's <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer" className="text-[#2271b1] underline">Rich Results Test</a> or the <a href="https://validator.schema.org/" target="_blank" rel="noreferrer" className="text-[#2271b1] underline">Schema.org Validator</a>. Whatever is entered here will be rendered dynamically in the page &lt;head&gt; as structured JSON-LD.
        </span>
      </div>
    </div>
  );
}
