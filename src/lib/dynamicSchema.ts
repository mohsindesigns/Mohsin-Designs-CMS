import { BASE_URL } from "./constants";
import { COUNTRIES_DATABASE } from "./countryLocations";

export interface SchemaContext {
  pageTitle?: string;
  pageSlug?: string;
  template?: string;
  metaDescription?: string;
  metaTitle?: string;
  ogImage?: string;
  content?: any;
  seo?: any;
  faqs?: Array<{ question?: string; answer?: string; q?: string; a?: string }>;
  globalSettings?: any;
}

/**
 * Normalizes and extracts location details (name, type, coordinates, state code)
 * from page content, template name, title, or slug.
 */
export function extractLocationInfo(
  slug: string = "",
  title: string = "",
  template: string = "",
  content: any = {}
): {
  name: string;
  type: "State" | "City" | "Country" | "AdministrativeArea";
  code?: string;
  latitude?: number;
  longitude?: number;
  country: string;
} {
  // 1. Check explicit content fields
  const rawLoc =
    content?.locationName ||
    content?.location ||
    content?.hero?.location ||
    content?.hero?.state ||
    content?.hero?.stateName ||
    content?.hero?.city ||
    content?.hero?.cityName ||
    content?.hero?.country ||
    "";

  let detectedName = typeof rawLoc === "string" ? rawLoc.trim() : "";

  // 2. If not in content, extract from slug or title
  if (!detectedName) {
    const slugParts = slug.split("/").filter(Boolean);
    const lastPart = slugParts[slugParts.length - 1] || "";

    // Clean up slug (e.g. "texas-web-design" -> "Texas", "georgia" -> "Georgia")
    const cleanLast = lastPart
      .replace(/-web-design|-web-development|-services|-agency/gi, "")
      .replace(/-/g, " ")
      .trim();

    if (cleanLast) {
      detectedName = cleanLast
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    } else if (title) {
      // Try from title (e.g. "Web Design in Texas" -> "Texas")
      const titleMatch = title.match(/\b(?:in|for|near|across)\s+([A-Za-z\s]+)/i);
      if (titleMatch && titleMatch[1]) {
        detectedName = titleMatch[1].trim();
      } else {
        detectedName = title.split("|")[0].split("-")[0].trim();
      }
    }
  }

  // Determine Type based on template or slug structure
  const lowerTemplate = (template || "").toLowerCase();
  let type: "State" | "City" | "Country" | "AdministrativeArea" = "AdministrativeArea";

  if (lowerTemplate.includes("state")) {
    type = "State";
  } else if (lowerTemplate.includes("city")) {
    type = "City";
  } else if (lowerTemplate.includes("country")) {
    type = "Country";
  } else {
    // Infer from slug
    if (slug.startsWith("city/") || slug.includes("/cities/")) {
      type = "City";
    } else if (slug.startsWith("state/") || slug.includes("/states/")) {
      type = "State";
    } else if (slug.startsWith("country/") || slug.includes("/countries/")) {
      type = "Country";
    }
  }

  // Look up coordinates and state code in COUNTRIES_DATABASE
  let latitude: number | undefined;
  let longitude: number | undefined;
  let code: string | undefined;
  const searchName = detectedName.toLowerCase();

  for (const [key, data] of Object.entries(COUNTRIES_DATABASE)) {
    const cleanKey = key.split(",")[0].trim().toLowerCase();
    if (
      cleanKey === searchName ||
      data.aliases.some((a) => a.toLowerCase() === searchName)
    ) {
      latitude = data.lat;
      longitude = data.lng;
      // Extract US state abbreviation if present in aliases
      const stateCodeAlias = data.aliases.find((a) => a.length === 2 && /^[a-z]{2}$/i.test(a));
      if (stateCodeAlias) code = stateCodeAlias.toUpperCase();
      break;
    }
  }

  return {
    name: detectedName || "United States",
    type,
    code,
    latitude,
    longitude,
    country: "US"
  };
}

/**
 * Builds the complete variable replacement map for a given page.
 */
export function buildSchemaVariableMap(
  page: any = {},
  globalData: any = {},
  slug: string = ""
): Record<string, string> {
  const cleanSlug = (slug || page.slug || "").replace(/^\/+|\/+$/g, "");
  const pageUrl = `${BASE_URL}/${cleanSlug ? cleanSlug + "/" : ""}`;
  const settings = globalData?.settings || {};

  const locationInfo = extractLocationInfo(
    cleanSlug,
    page.title || "",
    page.template || "",
    page.content || {}
  );

  const companyName = settings.siteName || settings.brandName || "Mohsin Designs";
  const companyPhone = settings.contactPhone || settings.phone || "+1 (614) 555-0192";
  const companyEmail = settings.contactEmail || settings.email || "contact@mohsindesigns.com";
  const pageTitle = page.seo?.metaTitle || page.title || "";
  const pageDesc =
    page.seo?.metaDescription ||
    page.content?.hero?.description ||
    page.content?.description ||
    "";
  const pageImg =
    page.seo?.ogImage ||
    page.seo?.featuredImage ||
    `${BASE_URL}/logo.png`;

  const serviceTitle =
    page.content?.hero?.titleIntro ||
    page.content?.hero?.titleHighlight ||
    page.title ||
    "Custom Web Development";

  const serviceCategory =
    page.content?.hero?.eyebrow ||
    page.content?.category ||
    "Digital Engineering";

  const industryName =
    page.content?.hero?.titleHighlight ||
    locationInfo.name ||
    page.title ||
    "Enterprise";

  return {
    // Page variables
    "page.title": pageTitle,
    "page.url": pageUrl,
    "page.description": pageDesc,
    "page.image": pageImg,
    "page.slug": cleanSlug,

    // Location variables
    "location.name": locationInfo.name,
    "location.type": locationInfo.type,
    "location.code": locationInfo.code || "",
    "location.latitude": locationInfo.latitude ? String(locationInfo.latitude) : "",
    "location.longitude": locationInfo.longitude ? String(locationInfo.longitude) : "",
    "location.country": locationInfo.country,

    // Service variables
    "service.title": serviceTitle,
    "service.category": serviceCategory,
    "service.description": pageDesc,
    "service.startingPrice": page.content?.pricing?.startingPrice || "1500",

    // Industry variables
    "industry.name": industryName,

    // Company / Site variables
    "company.name": companyName,
    "company.phone": companyPhone,
    "company.email": companyEmail,
    "site.name": companyName,
    "site.url": `${BASE_URL}/`,
    "site.logo": `${BASE_URL}/logo.png`,

    // Short alias variables
    "title": pageTitle,
    "url": pageUrl,
    "description": pageDesc,
    "location": locationInfo.name
  };
}

/**
 * Replaces {{variable}} tokens inside a raw schema string.
 * Escapes replacement strings safely to prevent breaking JSON strings.
 */
export function resolveDynamicSchemaTokens(
  rawSchema: string,
  variables: Record<string, string>
): string {
  if (!rawSchema || typeof rawSchema !== "string") return "";

  // Regex matches {{variable.name}} or {{ variable.name }}
  return rawSchema.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
    const val = variables[key.trim()];
    if (val === undefined || val === null) {
      return match; // keep if unknown
    }

    // JSON-escape quotes, newlines, and backslashes so JSON syntax is preserved
    return String(val)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  });
}

/**
 * Automatically builds an appropriate Schema.org JSON-LD structure
 * based on the page's template and content if no custom schema is provided.
 */
export function generateAutoSchemaForPage(
  page: any = {},
  globalData: any = {},
  slug: string = ""
): any[] {
  const cleanSlug = (slug || page.slug || "").replace(/^\/+|\/+$/g, "");
  const pageUrl = `${BASE_URL}/${cleanSlug ? cleanSlug + "/" : ""}`;
  const template = (page.template || "").toLowerCase();
  const settings = globalData?.settings || {};
  const companyName = settings.siteName || "Mohsin Designs";
  const companyPhone = settings.contactPhone || "+1 (614) 555-0192";
  const companyEmail = settings.contactEmail || "contact@mohsindesigns.com";
  const pageTitle = page.seo?.metaTitle || page.title || "";
  const pageDesc =
    page.seo?.metaDescription ||
    page.content?.hero?.description ||
    page.content?.description ||
    "Bespoke digital architecture, web applications, and conversion-first UI/UX.";

  const schemas: any[] = [];

  // 1. Location-based templates (state, city, country, location, service-area)
  if (
    template === "state" ||
    template === "city" ||
    template === "country" ||
    template === "location" ||
    template === "locations" ||
    template === "service-area"
  ) {
    const loc = extractLocationInfo(cleanSlug, pageTitle, template, page.content || {});
    const localBusinessSchema: any = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": `${companyName} - ${loc.name}`,
      "url": pageUrl,
      "description": pageDesc,
      "telephone": companyPhone,
      "email": companyEmail,
      "priceRange": "$$",
      "areaServed": {
        "@type": loc.type,
        "name": loc.name
      },
      "provider": {
        "@type": "Organization",
        "name": companyName,
        "url": `${BASE_URL}/`,
        "logo": `${BASE_URL}/logo.png`
      }
    };

    if (loc.latitude && loc.longitude) {
      localBusinessSchema.geo = {
        "@type": "GeoCoordinates",
        "latitude": loc.latitude,
        "longitude": loc.longitude
      };
    }

    schemas.push(localBusinessSchema);
  }

  // 2. Service Detail template
  else if (template === "service-detail" || template === "services") {
    const serviceTitle = page.title || pageTitle;
    const serviceDesc = page.seo?.metaDescription || page.description || page.content?.hero?.description || pageDesc;
    const serviceSchema: any = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": serviceTitle,
      "serviceType": page.category || page.content?.hero?.eyebrow || page.hero?.eyebrow || "Digital Engineering",
      "description": serviceDesc,
      "url": pageUrl,
      "provider": {
        "@type": "ProfessionalService",
        "name": companyName,
        "url": `${BASE_URL}/`,
        "logo": `${BASE_URL}/logo.png`,
        "telephone": companyPhone,
        "email": companyEmail,
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US"
        }
      }
    };

    // Area served from serviceAreaSource or default
    const countries = Array.isArray(page.serviceAreaSource?.countries)
      ? page.serviceAreaSource.countries
      : (Array.isArray(page.content?.serviceAreaSource?.countries) ? page.content.serviceAreaSource.countries : []);

    if (countries.length > 0) {
      serviceSchema.areaServed = countries.map((c: string) => ({
        "@type": "Country",
        "name": c
      }));
    } else {
      serviceSchema.areaServed = {
        "@type": "Country",
        "name": "United States"
      };
    }

    // If pricing plans exist
    const plans = (Array.isArray(page.pricing?.plans) && page.pricing.plans.length > 0)
      ? page.pricing.plans
      : (Array.isArray(page.content?.pricing?.plans) ? page.content.pricing.plans : []);

    if (plans.length > 0) {
      serviceSchema.hasOfferCatalog = {
        "@type": "OfferCatalog",
        "name": `${serviceTitle} Packages`,
        "itemListElement": plans.map((p: any) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": p.name || p.title || serviceTitle
          },
          "priceCurrency": "USD",
          "price": p.price ? String(p.price).replace(/[^0-9.]/g, "") || "0" : "0",
          "description": p.desc || p.description || ""
        }))
      };
    }

    if (page.createdAt) {
      serviceSchema.datePublished = new Date(page.createdAt).toISOString();
    }
    if (page.updatedAt) {
      serviceSchema.dateModified = new Date(page.updatedAt).toISOString();
    }

    schemas.push(serviceSchema);
  }

  // 3. Industry template
  else if (template === "industry" || template === "industries") {
    const industryName = page.content?.hero?.titleHighlight || pageTitle;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": pageTitle,
      "serviceType": `${industryName} Digital Solutions`,
      "category": industryName,
      "description": pageDesc,
      "url": pageUrl,
      "provider": {
        "@type": "Organization",
        "name": companyName,
        "url": `${BASE_URL}/`,
        "logo": `${BASE_URL}/logo.png`
      }
    });
  }

  // 4. Inline FAQs or FAQ template
  const rawFaqs =
    page.faqs ||
    page.content?.faqs ||
    (Array.isArray(page.content?.faq?.items) ? page.content.faq.items : []);

  if (Array.isArray(rawFaqs) && rawFaqs.length > 0) {
    const validFaqs = rawFaqs
      .map((f: any) => ({
        question: f.question || f.q || "",
        answer: f.answer || f.a || ""
      }))
      .filter((f) => f.question && f.answer);

    if (validFaqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": validFaqs.map((f) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      });
    }
  }

  // 5. Automatic BreadcrumbList for subpages
  if (cleanSlug) {
    const segments = cleanSlug.split("/").filter(Boolean);
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${BASE_URL}/`
      }
    ];

    let runningPath = "";
    segments.forEach((seg: string, idx: number) => {
      runningPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const segTitle = isLast
        ? (page.title || pageTitle)
        : seg
            .replace(/-/g, " ")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

      breadcrumbItems.push({
        "@type": "ListItem",
        "position": idx + 2,
        "name": segTitle,
        "item": `${BASE_URL}${runningPath}/`
      });
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    });
  }

  return schemas;
}

/**
 * Main function called at render time. Resolves all schemas for a page:
 * 1. If custom schema exists, interpolates dynamic {{variables}}.
 * 2. If no custom schema exists, generates appropriate schema for that template.
 * Returns an array of JSON strings ready for <script type="application/ld+json">.
 */
export function getResolvedSchemaBlocks({
  page,
  globalData,
  slug
}: {
  page: any;
  globalData?: any;
  slug?: string;
}): string[] {
  if (!page) return [];

  const effectiveSlug = slug || page.slug || "";
  const varMap = buildSchemaVariableMap(page, globalData, effectiveSlug);

  // Custom schema configured on the page
  const rawCustomSchema =
    page.seo?.schemaData ||
    page.content?.schemaMarkup ||
    page.content?.customSchema ||
    page.schemaMarkup ||
    "";

  const blocks: string[] = [];

  if (rawCustomSchema && typeof rawCustomSchema === "string" && rawCustomSchema.trim().length > 0) {
    // Interpolate tokens inside custom schema
    const resolved = resolveDynamicSchemaTokens(rawCustomSchema, varMap);
    blocks.push(resolved);

    // Auto-generate missing schemas:
    // If the custom schema does NOT already include a schema type (e.g. only FAQPage was configured),
    // still include the primary template schema (e.g. Service) and BreadcrumbList!
    const autoList = generateAutoSchemaForPage(page, globalData, effectiveSlug);
    for (const autoItem of autoList) {
      const type = autoItem["@type"];
      if (type && !resolved.includes(`"${type}"`)) {
        blocks.push(JSON.stringify(autoItem));
      }
    }
  } else {
    // No custom schema provided -> generate complete auto schema
    const autoSchemas = generateAutoSchemaForPage(page, globalData, effectiveSlug);
    for (const s of autoSchemas) {
      blocks.push(JSON.stringify(s));
    }
  }

  return blocks;
}
