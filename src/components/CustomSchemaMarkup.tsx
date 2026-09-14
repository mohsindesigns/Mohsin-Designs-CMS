import React from "react";

/**
 * Extracts and cleans JSON-LD blocks from user-provided schema data.
 * Supports:
 * - Pure JSON strings
 * - Script-tag wrapped content (<script type="application/ld+json">...</script>)
 * - Multiple script tags
 * - Parsed JavaScript objects/arrays
 */
export function extractSchemaBlocks(rawSchema: any): string[] {
  if (!rawSchema) return [];

  // If array, extract blocks from each item recursively
  if (Array.isArray(rawSchema)) {
    const blocks: string[] = [];
    for (const item of rawSchema) {
      blocks.push(...extractSchemaBlocks(item));
    }
    return blocks;
  }

  // If plain object, stringify it
  if (typeof rawSchema === "object") {
    try {
      return [JSON.stringify(rawSchema)];
    } catch {
      return [];
    }
  }

  if (typeof rawSchema !== "string") return [];
  const trimmed = rawSchema.trim();
  if (!trimmed) return [];

  // Check if wrapped in <script> tags
  if (trimmed.includes("<script")) {
    const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(trimmed)) !== null) {
      if (match[1] && match[1].trim()) {
        const content = match[1].trim();
        // Verify it parses or is non-empty
        blocks.push(content);
      }
    }
    if (blocks.length > 0) return blocks;
  }

  // Pure JSON string or plain text block
  return [trimmed];
}

interface CustomSchemaMarkupProps {
  schema?: any;
  schemaData?: any;
}

// Prevents any embedded schema content (however it got there - a single
// field's raw markup, or pieces of otherwise-harmless text from SEPARATE
// fields that only become a real tag once concatenated together in the
// serialized JSON) from ever being interpreted as HTML: no tag, including
// "</script>", can begin without a literal "<" character, so escaping every
// "<" to its unicode equivalent closes this class of script-breakout
// regardless of which upstream field(s) the dangerous text came from. This
// is the standard mitigation for embedding untrusted JSON inside a real
// <script> tag (rather than trying to sanitize every source field that
// might eventually be concatenated into one JSON blob).
function escapeForScriptTag(json: string): string {
  return json.replace(/</g, "\\u003C");
}

export default function CustomSchemaMarkup({ schema, schemaData }: CustomSchemaMarkupProps) {
  const target = schema !== undefined ? schema : schemaData;
  const blocks = extractSchemaBlocks(target);
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={`custom-json-ld-${index}`}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: escapeForScriptTag(block) }}
        />
      ))}
    </>
  );
}
