"use client";

import React from "react";
import DOMPurify from "dompurify";
import { makeLinksDoFollow, cleanMojibake } from "@/lib/utils";

interface RichTextRendererProps {
  content: string | string[];
  className?: string;
  stripParagraphs?: boolean;
}

export default function RichTextRenderer({ content, className = "", stripParagraphs = false }: RichTextRendererProps) {
  // Safe sanitize helper that handles Next.js ESM/CJS interop and SSR
  const safeSanitize = (html: string) => {
    if (typeof window === "undefined") return html;
    
    // Handle different import patterns (default vs named)
    const purify = (DOMPurify as any).default || DOMPurify;
    if (purify && typeof purify.sanitize === "function") {
      return purify.sanitize(html);
    }
    return html;
  };

  // Handle array of strings (legacy bio/description pattern)
  if (Array.isArray(content)) {
    return (
      <div className={`space-y-4 ${className}`}>
        {content.map((p, i) => (
          <div 
            key={i} 
            dangerouslySetInnerHTML={{ __html: makeLinksDoFollow(safeSanitize(cleanMojibake(p))) }} 
            className="rich-text-content"
          />
        ))}
      </div>
    );
  }

  if (!content) return null;

  // Sanitize and render single HTML string
  let sanitizedHtml = safeSanitize(cleanMojibake(content as string));

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

  sanitizedHtml = makeLinksDoFollow(unescapeLiteralTags(sanitizedHtml));

  // If stripParagraphs is true, remove all P tags (real or just unescaped)
  if (stripParagraphs) {
    sanitizedHtml = sanitizedHtml
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/\n/g, ' '); // Replace newlines with spaces for single line flow
  }

  return (
    <div 
      className={`rich-text-content 
        font-body text-foreground/80 leading-relaxed
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

