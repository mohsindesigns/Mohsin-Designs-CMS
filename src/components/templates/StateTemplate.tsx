"use client";

import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import { useContent } from "@/hooks/useContent";
import { BASE_URL } from "@/lib/constants";
import { resolveCountryLocation } from "@/lib/countryLocations";
import { lookupUsCity } from "@/lib/usCityCoords";
import { pathSegmentsOfUrl } from "@/lib/locationPath";
import { parseVideoEmbed } from "@/lib/videoEmbed";

const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const AboutOwnerClean = dynamic(() => import("@/components/AboutOwnerClean"), { ssr: false });
const TrustedBrandsSection = dynamic(() => import("@/components/sections/TrustedBrandsSection"), { ssr: false });
const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"), { ssr: false });
const ServiceArea = dynamic(() => import("@/components/ServiceArea"), { ssr: false });
const IndustriesSection = dynamic(() => import("@/components/IndustriesSection"), { ssr: false });

function hasContent(obj: any): boolean {
  if (!obj) return false;
  if (typeof obj === 'object' && obj.enabled === false) return false;
  if (typeof obj === 'string') return obj.trim().length > 0;
  if (typeof obj === 'number') return true;
  if (typeof obj === 'boolean') return obj;
  if (Array.isArray(obj)) return obj.length > 0 && obj.some(hasContent);
  if (typeof obj === 'object') {
    return Object.entries(obj).some(([k, v]) => k !== 'enabled' && hasContent(v));
  }
  return false;
}

const text = (v: any) => (typeof v === "string" ? v.trim() : "");

// ---------------------------------------------------------------------------------------------
// Several shared section components silently substitute built-in DEMO content when their list is
// empty (Testimonials -> "Marcus Vance..." cards, Portfolio -> "Aether" case studies, BlogSection ->
// "Next.js 15 SaaS" posts, HowWeWork -> generic reasons). On a state page that means fake reviews /
// projects / articles. `hasContent()` alone can't catch it (a section header string is "content"),
// so each of these sections is additionally gated on having at least one REAL item.
// ---------------------------------------------------------------------------------------------
const firstArray = (...candidates: any[]): any[] => {
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
};

/** Testimonials.tsx reads list -> items -> testimonials; blank rows (admin "add" defaults) are not reviews. */
function hasRealReviews(t: any): boolean {
  if (!t || typeof t !== "object") return false;
  return [t.list, t.items, t.testimonials].some(
    (arr) => Array.isArray(arr) && arr.some((r: any) => r && (text(r.quote) || text(r.text)))
  );
}

/** TrustedBrandsSection shows "Google Cloud / Shopify / Stripe..." placeholder brands when it has no logos of its own. */
function hasBrandLogos(t: any): boolean {
  const arr = firstArray(Array.isArray(t?.logos) && t.logos.length > 0 ? t.logos : undefined, t?.items);
  return arr.some((x: any) => x && (text(x.name) || text(x.image)));
}

/** IndustriesSection falls back to six generic demo industries (list -> items -> domains). */
function hasIndustryItems(i: any): boolean {
  const arr = [i?.list, i?.items, i?.domains].find((a) => Array.isArray(a) && a.length > 0) || [];
  return arr.some((x: any) => x && text(x.title));
}

/** ServiceArea falls back to a 12-country "worldwide" hub list when it has no hubs of its own. */
function hasHubs(sa: any): boolean {
  return Array.isArray(sa?.hubs) && sa.hubs.some((h: any) => h && text(h.name));
}

/** Same precedence as Portfolio.tsx (projects -> caseStudies). */
function hasProjects(p: any): boolean {
  const arr = firstArray(p?.projects, p?.caseStudies);
  return arr.some((x: any) => x && (text(x.title) || text(x.brand)));
}

/** Same precedence as Services.tsx (list -> services). Drafts/trashed never render. */
function hasServices(s: any): boolean {
  const arr = firstArray(s?.list, s?.services);
  return arr.some((x: any) => x && x.status !== "draft" && !x.isTrashed && (typeof x === "string" || text(x.title) || x._id || x.id || x.slug));
}

/** Reasons (or legacy `features`) - HowWeWork shows generic demo reasons when both are empty. */
function hasReasons(w: any): boolean {
  const arr = [w?.reasons, w?.features].find((a) => Array.isArray(a) && a.length > 0) || [];
  return arr.some((x: any) => x && (text(x.title) || text(x.desc) || text(x.description)));
}

/** VideoTestimonials renders nothing without a playable video; don't leave its wrapper/anchor behind. */
function hasPlayableVideo(v: any): boolean {
  const items = Array.isArray(v?.items) ? v.items : [];
  return items.some((it: any) => {
    const url = text(it?.videoUrl);
    if (!url) return false;
    return it?.videoType === "embed" ? !!parseVideoEmbed(url).embedUrl : true;
  });
}

/** An FAQ row with neither question nor answer is an untouched "+ Add FAQ" default. */
function realFaqs(faqs: any): any[] {
  return (Array.isArray(faqs) ? faqs : []).filter((f: any) => f && (text(f.question) || text(f.answer) || text(f.q) || text(f.a)));
}

// ---------------------------------------------------------------------------------------------
// Service Area map. On a state page the hubs are the state's CITIES, but <ServiceArea> geocodes a
// hub by NAME against a countries/states-only table, so most cities fall back to (20N, 0E) - a pin
// in the Atlantic - and "Jackson"/"Athens"/"Columbus" resolve to another state or a country.
// Give every city hub (link = /country/state/city/) real coordinates: explicit hub.lat/lng win,
// then the city table, then a spot near the state's centre so the pin is at least in the state.
// ---------------------------------------------------------------------------------------------
const SITE_HOST = (() => {
  try { return new URL(BASE_URL).hostname.replace(/^www\./, ""); } catch { return ""; }
})();

/** Same-site absolute links (https://mohsindesigns.com/usa/x/) become relative so visitors stay in this environment. */
function toInternalHref(href?: string): string | undefined {
  if (!href || typeof href !== "string") return href;
  const v = href.trim();
  if (!/^https?:\/\//i.test(v)) return v;
  try {
    const u = new URL(v);
    if (SITE_HOST && u.hostname.replace(/^www\./, "") === SITE_HOST) return `${u.pathname}${u.search}${u.hash}` || "/";
  } catch { /* leave as is */ }
  return v;
}

function withCityCoordinates(serviceArea: any, stateSlug: string, stateName: string, countryName: string, countrySlug: string) {
  const hubs: any[] = Array.isArray(serviceArea?.hubs) ? serviceArea.hubs : [];
  if (hubs.length === 0) return serviceArea;

  // State centre from the shared gazetteer ("Texas, USA" / "Victoria, Australia"); null if unknown.
  let center: { lat: number; lng: number } | null = null;
  const queries = [countryName && `${stateName}, ${countryName}`, /^(usa|us|united-states)$/.test(countrySlug) ? `${stateName}, USA` : ""].filter(Boolean) as string[];
  for (const q of queries) {
    const r = resolveCountryLocation(q);
    if (r.name !== q) { center = { lat: r.lat, lng: r.lng }; break; }
  }

  const isCityHub = (h: any) => pathSegmentsOfUrl(h?.link || h?.href || h?.url).length >= 3;
  const cityHubCount = hubs.filter(isCityHub).length;
  let ring = 0;

  const next = hubs.map((hub: any) => {
    if (!hub || typeof hub !== "object") return hub;
    const link = toInternalHref(hub.link || hub.href || hub.url);
    const base = link !== (hub.link || hub.href || hub.url) ? { ...hub, link } : hub;
    if (typeof hub.lat === "number" && typeof hub.lng === "number") return base;
    if (!isCityHub(hub)) return base;

    const segs = pathSegmentsOfUrl(hub.link || hub.href || hub.url);
    const known = lookupUsCity(stateSlug, segs[segs.length - 1], hub.name);
    if (known) return { ...base, lat: known[0], lng: known[1] };
    if (center) {
      const angle = (2 * Math.PI * ring++) / Math.max(cityHubCount, 1) + 0.6;
      return { ...base, lat: center.lat + 1.1 * Math.sin(angle), lng: center.lng + 1.4 * Math.cos(angle) };
    }
    return base;
  });
  return { ...serviceArea, hubs: next };
}

const titleCase = (s: string) => s.split("-").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function StateTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { allBlogs } = useContent();
  const content = pageData?.content || {};

  // The URL the visitor is actually on is /{country}/{state}/. A legacy page may still store a flat
  // slug ("nevada"), so build the breadcrumb trail from the route rather than from the stored slug.
  const routeSegs: string[] = Array.isArray(params?.slug) ? params.slug.filter(Boolean) : [];
  const routeSlug = routeSegs.join("/");
  const countrySlug: string = content.countrySlug || routeSegs[0] || "usa";
  const countryName: string = content.country || (/^(usa|us|united-states)$/.test(countrySlug) ? "USA" : titleCase(countrySlug));
  const stateSlug: string = content.stateSlug || routeSegs[1] || String(pageData?.slug || "").split("/").filter(Boolean).pop() || "";
  const stateName: string = content.state || pageData?.title || titleCase(stateSlug);
  const breadcrumbPage = {
    ...pageData,
    slug: routeSlug || pageData?.slug,
    content: { ...content, countrySlug, country: countryName },
  };

  // ---- visibility (explicit `enabled: false` always hides; otherwise the section needs real content) ----
  const heroShown = content.hero?.enabled !== false && hasContent(content.hero);

  const trustedData = [content.trustedBrands, content.clientTrust, content.trustedBy].find((t) => hasContent(t) && hasBrandLogos(t));
  const trustedShown =
    content.trustedBrands?.enabled !== false && content.clientTrust?.enabled !== false && content.trustedBy?.enabled !== false && !!trustedData;

  const videoShown = content.videoTestimonials?.enabled !== false && hasContent(content.videoTestimonials) && hasPlayableVideo(content.videoTestimonials);

  const aboutData = [content.about, content.aboutOwner].find(hasContent);
  const aboutShown = content.about?.enabled !== false && content.aboutOwner?.enabled !== false && !!aboutData;

  const servicesShown = content.services?.enabled !== false && hasContent(content.services) && hasServices(content.services);

  const industriesData = [content.industries, content.domainExpertise].find((i) => hasContent(i) && hasIndustryItems(i));
  const industriesShown = content.industries?.enabled !== false && content.domainExpertise?.enabled !== false && !!industriesData;

  const portfolioShown = content.portfolio?.enabled !== false && hasContent(content.portfolio) && hasProjects(content.portfolio);

  const reviewsData = [content.testimonials, content.reviews].find(hasRealReviews);
  const reviewsShown = content.testimonials?.enabled !== false && content.reviews?.enabled !== false && !!reviewsData;

  const howData = [content.whyChooseUs, content.howWeWork].find(hasContent);
  const howShown = content.whyChooseUs?.enabled !== false && content.howWeWork?.enabled !== false && !!howData && hasReasons(howData);

  const serviceAreaShown = content.serviceArea?.enabled !== false && hasContent(content.serviceArea) && hasHubs(content.serviceArea);

  const faqItems = realFaqs(content.faqs);
  const faqShown = content.faqs?.enabled !== false && content.faqSection?.enabled !== false && faqItems.length > 0;

  const contactShown =
    content.contact?.enabled !== false && content.quote?.enabled !== false && (hasContent(content.contact) || hasContent(content.quote));

  // Blog: the editor promises "latest published posts" when none are picked, so a configured
  // section with no picks shows the latest 4. Nothing is rendered until real posts exist (BlogSection
  // would otherwise flash its built-in demo articles while /api/blogs is still loading).
  const blogCfg = content.blogSection || content.blog;
  const pool: any[] = Array.isArray(allBlogs) ? allBlogs : [];
  const picked: any[] = Array.isArray(blogCfg?.selectedPosts) ? blogCfg.selectedPosts : [];
  const blogPosts: any[] = picked.length > 0
    ? picked
        .map((sel: any) => pool.find((p: any) => String(p?._id ?? p?.id) === String(sel?._id ?? sel?.id ?? sel) || (p?.slug && p.slug === sel)))
        .filter(Boolean)
    : pool.slice(0, 4);
  const blogShown = content.blogSection?.enabled !== false && content.blog?.enabled !== false && hasContent(blogCfg) && blogPosts.length > 0;

  // Where "book a call" style buttons without their own link should land. `#contact` only exists when
  // the contact form is on the page; otherwise use the contact page (no dead anchors).
  const contactFallbackHref = contactShown ? "#contact" : "/contact-us/";

  const serviceAreaData = serviceAreaShown
    ? withCityCoordinates(
        { ...content.serviceArea, ctaHref: content.serviceArea.ctaHref || content.serviceArea.ctaLink || contactFallbackHref },
        stateSlug,
        stateName,
        countryName,
        countrySlug
      )
    : null;

  const faqData = {
    ...content,
    strategyAudit: { ...(content.strategyAudit || {}), href: content.strategyAudit?.href || contactFallbackHref },
  };

  return (
    <div className="relative">
      {/* 1. Hero Section (owns the page's single <h1>; keep one for SEO/a11y when it is hidden) */}
      {heroShown ? (
        <Hero data={content.hero} breadcrumb={<PageBreadcrumbs page={breadcrumbPage} />} />
      ) : (
        <h1 className="sr-only">{pageData?.title || stateName}</h1>
      )}

      {/* 1.5 Trusted Brands */}
      {trustedShown && <TrustedBrandsSection data={trustedData} />}

      {/* 1.6 Video Testimonials */}
      {videoShown && (
        <section id="video-testimonials">
          <VideoTestimonials data={content.videoTestimonials} />
        </section>
      )}

      {/* 2. About The Owner (Clean - No stats, No CTA button) */}
      {aboutShown && <AboutOwnerClean data={aboutData} />}

      {/* 3. Services Section */}
      {servicesShown && <Services data={content.services} masterCatalog={content.globalServices} />}

      {/* 3.5 Industries We Serve */}
      {industriesShown && <IndustriesSection data={industriesData} />}

      {/* 4. Selected Portfolio Projects */}
      {portfolioShown && <Portfolio data={content.portfolio} />}

      {/* 5. Reviews / Testimonials */}
      {reviewsShown && <Testimonials data={reviewsData} />}

      {/* 6. How We Work / Value Props */}
      {howShown && <HowWeWork data={howData} />}

      {/* 7. Service Area (State & Metro cities) */}
      {serviceAreaShown && <ServiceArea data={serviceAreaData} />}

      {/* 8. FAQ Section */}
      {faqShown && (
        <PageInlineFaqs
          faqs={faqItems}
          faqSchemaMarkup={content.faqSchemaMarkup}
          badge={content.faqBadge}
          title={content.faqTitleHighlight || content.faqTitle}
          description={content.faqDescription}
          data={faqData}
        />
      )}

      {/* 9. Blog Section */}
      {blogShown && (
        <BlogSection
          title={blogCfg.title}
          subtitle={blogCfg.subtitle}
          description={blogCfg.description}
          data={blogCfg}
          posts={blogPosts}
        />
      )}

      {/* 10. CTA Contact Form */}
      {contactShown && <ContactForm data={content.contact} />}
    </div>
  );
}
