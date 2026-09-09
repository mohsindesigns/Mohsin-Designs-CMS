import { BASE_URL } from "./constants";

/**
 * Safely parses and cleans user-provided schema markup.
 * Extracts JSON-LD from raw JSON strings or <script> tags.
 */
export function extractSchemaBlocks(rawSchema: any): string[] {
  if (!rawSchema) return [];

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

  // If user wrapped in <script> tags, extract the inner contents
  if (trimmed.includes("<script")) {
    const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(trimmed)) !== null) {
      if (match[1] && match[1].trim()) {
        blocks.push(match[1].trim());
      }
    }
    if (blocks.length > 0) return blocks;
  }

  return [trimmed];
}

/**
 * Legacy schema generator placeholder.
 * Hardcoded fake LocalBusiness and Organization schemas have been removed as requested.
 * Custom schema configured in each page/template should be used instead.
 */
export function generateSchema(options?: any) {
  // Return null or empty graph so no fake hardcoded schemas are generated
  return null;
}
