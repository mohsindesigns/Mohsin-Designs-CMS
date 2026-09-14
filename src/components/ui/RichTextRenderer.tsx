"use client";

import React from "react";
import DOMPurify from "dompurify";
import { makeLinksDoFollow, cleanMojibake } from "@/lib/utils";

interface RichTextRendererProps {
  content: string | string[];
  className?: string;
  stripParagraphs?: boolean;
}

// Server-side (SSR) fallback sanitizer. DOMPurify needs a real DOM (`window`),
// which doesn't exist during Next.js server rendering - without this, content
// was shipped to every visitor completely unsanitized on the initial
// (ISR-cached) HTML response, before any client-side sanitization could ever
// run. This is intentionally NOT a general HTML parser: it's an allowlist-
// style stripper scoped to what this app's TipTap-based editor can actually
// produce (paragraphs, headings, bold/italic/underline, lists, links,
// images) - it removes script-capable elements, event-handler attributes,
// and javascript:/data: URLs rather than attempting to parse arbitrary HTML.
function serverSideSanitize(html: string): string {
  if (!html) return html;
  let out = html;
  // Remove dangerous elements entirely, including their content.
  out = out.replace(/<(script|style|iframe|object|embed|link|meta|svg|math|form|base)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  // Remove any self-closing/void form of the same tags.
  out = out.replace(/<(script|style|iframe|object|embed|link|meta|svg|math|form|base)\b[^>]*\/?>/gi, "");
  // Strip event-handler attributes (onerror=, onclick=, onload=, etc.) from any remaining tag.
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Neutralize javascript:/data:/vbscript: URLs in href/src/action attributes.
  out = out.replace(/(href|src|action)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1="#"');
  // Strip any inline style attribute (defense against url(javascript:...) etc).
  out = out.replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, "");
  return out;
}

export default function RichTextRenderer({ content, className = "", stripParagraphs = false }: RichTextRendererProps) {
  // Safe sanitize helper that handles Next.js ESM/CJS interop and SSR
  const safeSanitize = (html: string) => {
    if (typeof window === "undefined") return serverSideSanitize(html);

    // Handle different import patterns (default vs named)
    const purify = (DOMPurify as any).default || DOMPurify;
    if (purify && typeof purify.sanitize === "function") {
      return purify.sanitize(html);
    }
    return serverSideSanitize(html);
  };

  // Helper to parse markdown links [Anchor Text](url) into standard HTML <a> tags
  const parseMarkdownLinks = (text: string) => {
    if (!text || typeof text !== "string") return text;
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="rich-text-link">$1</a>');
  };

  // Handle array of strings (legacy bio/description pattern)
  if (Array.isArray(content)) {
    return (
      <div className={`space-y-4 pointer-events-auto ${className}`}>
        {content.map((p, i) => (
          <div 
            key={i} 
            dangerouslySetInnerHTML={{ __html: makeLinksDoFollow(safeSanitize(parseMarkdownLinks(cleanMojibake(p)))) }} 
            className="rich-text-content pointer-events-auto"
          />
        ))}
      </div>
    );
  }

  if (!content) return null;

  // Sanitize and render single HTML string with markdown link parsing
  let sanitizedHtml = safeSanitize(parseMarkdownLinks(cleanMojibake(content as string)));

  // If the user is seeing literal <p> tags, it might be due to double escaping
  // or the editor's output being rendered as text.
  // We'll decode common escaped tags if they are found as literal text.
  const unescapeLiteralTags = (html: string) => {
    return html
      .replace(/&lt;p&gt;/gi, '<p>')
      .replace(/&lt;\/p&gt;/gi, '</p>')
      .replace(/&lt;br\s*\/?&gt;/gi, '<br />')
      .replace(/&lt;b&gt;/gi, '<b>')
      .replace(/&lt;\/b&gt;/gi, '</b>')
      .replace(/&lt;strong&gt;/gi, '<strong>')
      .replace(/&lt;\/strong&gt;/gi, '</strong>');
  };

  // Helper to normalize and strip harmful hardcoded inline black colors
  const stripInlineColors = (html: string) => {
    if (!html || typeof html !== "string") return html;
    return html
      .replace(/color:\s*(?:rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|#000000|#000|black);?/gi, '')
      .replace(/background-color:\s*transparent;?/gi, '');
  };

  sanitizedHtml = makeLinksDoFollow(unescapeLiteralTags(stripInlineColors(sanitizedHtml)));

  // If stripParagraphs is true, remove all P tags (real or just unescaped)
  if (stripParagraphs) {
    sanitizedHtml = sanitizedHtml
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/\n/g, ' '); // Replace newlines with spaces for single line flow
  }

  return (
    <div 
      className={`rich-text-content pointer-events-auto
        font-body text-foreground/80 leading-relaxed
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

