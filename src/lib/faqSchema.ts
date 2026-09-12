interface FaqSchemaItem {
  question?: string;
  answer?: string;
  q?: string;
  a?: string;
}

// Strips HTML tags/entities so rich-text authored FAQ content becomes plain
// text suitable for schema.org Question/acceptedAnswer string fields.
function toPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

/**
 * Builds a schema.org FAQPage JSON-LD object from a page/service's FAQ items.
 * Returns null when there are no usable items (nothing to sync).
 */
export function buildFaqSchema(items: FaqSchemaItem[] | undefined | null): Record<string, any> | null {
  if (!Array.isArray(items)) return null;

  const mainEntity = items
    .map((item) => ({
      question: toPlainText(item.question || item.q || ""),
      answer: toPlainText(item.answer || item.a || ""),
    }))
    .filter((item) => item.question && item.answer)
    .map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export type FaqSchemaSyncResult =
  | { status: "empty" }
  | { status: "cancelled" }
  | { status: "ok"; schemaString: string };

/**
 * Shared entry point for the "Sync FAQs to Schema" action in both the generic
 * page editor and the service editor. Confirms before clobbering schema markup
 * that wasn't produced by a previous FAQ sync (e.g. a manually-entered
 * LocalBusiness/Organization block in the Schema tab), mirroring the confirm()
 * guard SchemaEditor itself uses for its own destructive actions.
 */
export function syncFaqSchema(
  items: FaqSchemaItem[] | undefined | null,
  currentSchemaMarkup: string | undefined | null,
  wasAutoSynced: boolean
): FaqSchemaSyncResult {
  const generated = buildFaqSchema(items);
  if (!generated) return { status: "empty" };

  const hasExistingUnrelatedSchema = !!(currentSchemaMarkup && currentSchemaMarkup.trim()) && !wasAutoSynced;
  if (hasExistingUnrelatedSchema) {
    const proceed = window.confirm(
      "This page already has schema markup entered in the Schema tab. Syncing FAQ schema will replace it - this cannot be undone. Continue?"
    );
    if (!proceed) return { status: "cancelled" };
  }

  return { status: "ok", schemaString: JSON.stringify(generated, null, 2) };
}
