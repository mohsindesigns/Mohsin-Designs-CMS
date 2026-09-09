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
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}
    </>
  );
}
