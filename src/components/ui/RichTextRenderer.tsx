"use client";

import { normalizeHtmlLinks } from"@/lib/url";
import React from"react";
// isomorphic-dompurify runs real DOMPurify against a real DOM either way -
// jsdom on the server, the browser DOM on the client - rather than a
// hand-rolled regex sanitizer for the SSR path. A regex-based sanitizer was
// tried here first and repeatedly bypassed (non-recursive passes letting
// nested/decoy tags reform into a live tag, unquoted or slash-separated
// event-handler attributes, embedded tab/newline characters splitting a
// dangerous URL scheme past the pattern) - exactly the category of bug a
// real HTML parser doesn't have, since it isn't trying to out-guess every
// way markup can be spelled.
import DOMPurify from"isomorphic-dompurify";
import { makeLinksDoFollow, cleanMojibake } from"@/lib/utils";

interface RichTextRendererProps {
  content: string | string[];
  className?: string;
  stripParagraphs?: boolean;
}

export default function RichTextRenderer({ content, className ="", stripParagraphs = false }: RichTextRendererProps) {
  const safeSanitize = (html: string) => {
    if (!html) return html;
    try {
      return DOMPurify.sanitize(html);
    } catch {
      // If the sanitizer itself throws for any reason, fail closed (render
      // nothing) rather than falling back to unsanitized HTML.
      return"";
    }
  };

  // Helper to parse markdown links [Anchor Text](url) into standard HTML <a> tags
  const parseMarkdownLinks = (text: string) => {
    if (!text || typeof text !=="string") return text;
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="rich-text-link">$1</a>');
  };

  // Handle array of strings (legacy bio/description pattern)
  if (Array.isArray(content)) {
    return (
      <div className={`space-y-4 pointer-events-auto ${className}`}>
        {content.map((p, i) => (
          <div 
            key={i} 
            dangerouslySetInnerHTML={{ __html: normalizeHtmlLinks(makeLinksDoFollow(safeSanitize(parseMarkdownLinks(cleanMojibake(p))))) }} 
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
    if (!html || typeof html !=="string") return html;
    return html
      .replace(/color:\s*(?:rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|#000000|#000|black);?/gi, '')
      .replace(/background-color:\s*transparent;?/gi, '');
  };

  // Helper to strip empty headings (e.g. <h3></h3> or <h3>&nbsp;</h3> or <h3><br></h3>)
  const stripEmptyHeadings = (html: string) => {
    if (!html || typeof html !=="string") return html;
    return html.replace(/<h[1-6][^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s*)*<\/h[1-6]>/gi, '');
  };

  sanitizedHtml = normalizeHtmlLinks(stripEmptyHeadings(makeLinksDoFollow(unescapeLiteralTags(stripInlineColors(sanitizedHtml)))));

  // If stripParagraphs is true, remove all P tags (real or just unescaped)
  if (stripParagraphs) {
    sanitizedHtml = sanitizedHtml
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/\n/g, ' '); // Replace newlines with spaces for single line flow
  }

  // Only fall back to the default copy color when the caller hasn't supplied
  // their own text color class. Tailwind utilities of equal specificity are
  // resolved by compiled CSS order, not by className order, so always
  // including"text-foreground/80" here could silently outrank a caller's
  // override (e.g."text-white/90" on a dark CTA banner) depending on build
  // order - making the copy invisible on dark backgrounds.
  const hasColorOverride = /text-(white|black|slate|zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|brand|primary|secondary|foreground|muted|accent|\[)/.test(
    className
  );

  return (
    <div
      className={`rich-text-content pointer-events-auto
        font-body leading-relaxed ${hasColorOverride ?"[&_p]:!text-inherit [&_span]:!text-inherit [&_li]:!text-inherit" :"text-foreground/80"}
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

