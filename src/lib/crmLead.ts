// ─────────────────────────────────────────────────────────────────────────────
// Mohsin Designs CRM Lead Form Integration
//
// Endpoint: https://app.mohsindesigns.com/api/public/lead-forms/otXOxJkQULota1Ghk8Fh8ZQgGfFcmu4o/submit
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CRM_LEAD_FORM_ENDPOINT =
  "https://app.mohsindesigns.com/api/public/lead-forms/otXOxJkQULota1Ghk8Fh8ZQgGfFcmu4o/submit";

export const CRM_SERVICES = [
  "App Development",
  "Web Application",
  "Website Design",
  "SEO",
  "GMB Optimization",
  "Logo Design",
  "Branding",
  "UI/UX",
  "Content Marketing",
  "Social Media Management",
  "Google Ad Management",
  "Meta Ad Management",
] as const;

export type CrmService = (typeof CRM_SERVICES)[number];

/**
 * Normalizes any free-text service name, selection, or array into the exact
 * 12 configured multiselect options expected by app.mohsindesigns.com.
 */
export function mapToCrmServices(rawServiceInput: unknown): string[] {
  if (!rawServiceInput) return [];

  const rawString = Array.isArray(rawServiceInput)
    ? rawServiceInput.map((item) => String(item ?? "")).join(", ")
    : String(rawServiceInput);

  // Split on delimiters: commas, semicolons, pipes, slashes, plus signs, ampersands, or the word "and"
  const rawTokens = rawString
    .replace(/\s+and\s+/gi, ", ")
    .split(/[,;|/&+]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const matched = new Set<string>();

  for (const s of rawTokens) {
    if (
      !s ||
      s === "null" ||
      s === "undefined" ||
      s === "none" ||
      s === "none selected" ||
      s === "general" ||
      s === "other"
    ) {
      continue;
    }

    // 1. Direct case-insensitive match
    const exact = CRM_SERVICES.find((opt) => opt.toLowerCase() === s);
    if (exact) {
      matched.add(exact);
      continue;
    }

    // 2. Intelligent fuzzy mapping with strict prioritization
    if (
      s.includes("meta ad") ||
      s.includes("facebook ad") ||
      s.includes("fb ad") ||
      s.includes("meta campaign") ||
      s.includes("instagram ad")
    ) {
      matched.add("Meta Ad Management");
    } else if (
      s.includes("google ad") ||
      s.includes("ppc") ||
      s.includes("adwords") ||
      s.includes("sem")
    ) {
      matched.add("Google Ad Management");
    } else if (
      s.includes("social") ||
      s.includes("smm") ||
      s.includes("instagram") ||
      s.includes("facebook") ||
      s.includes("linkedin")
    ) {
      matched.add("Social Media Management");
    } else if (s.includes("mobile") || (s.includes("app") && !s.includes("web"))) {
      matched.add("App Development");
    } else if (
      s.includes("web app") ||
      s.includes("software") ||
      s.includes("saas") ||
      s.includes("portal")
    ) {
      matched.add("Web Application");
    } else if (
      s.includes("web") ||
      s.includes("website") ||
      s.includes("landing") ||
      s.includes("wordpress") ||
      s.includes("shopify")
    ) {
      matched.add("Website Design");
    } else if (s.includes("local seo")) {
      matched.add("SEO");
      matched.add("GMB Optimization");
    } else if (
      s.includes("gmb") ||
      s.includes("google my business") ||
      s.includes("google business") ||
      s.includes("map")
    ) {
      matched.add("GMB Optimization");
    } else if (s.includes("seo") || s.includes("search engine") || s.includes("rank")) {
      matched.add("SEO");
    } else if (s.includes("logo")) {
      matched.add("Logo Design");
    } else if (s.includes("brand") || s.includes("identity")) {
      matched.add("Branding");
    } else if (
      s.includes("ui") ||
      s.includes("ux") ||
      s.includes("figma") ||
      s.includes("wireframe") ||
      s.includes("prototype")
    ) {
      matched.add("UI/UX");
    } else if (
      s.includes("content") ||
      s.includes("copywriting") ||
      s.includes("blog") ||
      s.includes("article")
    ) {
      matched.add("Content Marketing");
    }
  }

  return Array.from(matched);
}

export interface CrmSubmitParams {
  name: string;
  email: string;
  phone?: string;
  service?: unknown;
  captchaToken?: string;
}

export interface CrmSubmitResult {
  success: boolean;
  status: number;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Submits lead data directly to the Mohsin Designs CRM Lead Form endpoint.
 * Note: Cloudflare Turnstile tokens are single-use; the CRM endpoint verifies
 * the token with Cloudflare directly.
 */
export async function submitLeadToCrm({
  name,
  email,
  phone,
  service,
  captchaToken,
}: CrmSubmitParams): Promise<CrmSubmitResult> {
  const endpoint =
    process.env.LEAD_FORM_API_URL ||
    process.env.NEXT_PUBLIC_LEAD_FORM_API_URL ||
    DEFAULT_CRM_LEAD_FORM_ENDPOINT;

  const servicesArray = mapToCrmServices(service);

  const payload: Record<string, any> = {
    answers: {
      full_name: (name || "Website Lead").trim(),
      email: (email || "").trim(),
      phone_number: (phone || "").trim() || "Not provided",
      service: servicesArray,
    },
  };

  if (captchaToken) {
    payload.turnstileToken = captchaToken;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout guard
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.success) {
      return {
        success: true,
        status: res.status,
        message: data.message || "Thank you! We will be in touch.",
        data,
      };
    }

    return {
      success: false,
      status: res.status,
      message: data.message || data.error || "CRM Lead Submission Error",
      error: data.error || data.message || `HTTP ${res.status}`,
      data,
    };
  } catch (err: any) {
    console.error("CRM Lead Form API Request Failed:", err);
    return {
      success: false,
      status: 0,
      error: err?.message || "Network error submitting lead to CRM",
    };
  }
}
