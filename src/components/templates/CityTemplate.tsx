"use client";

import { useMemo } from "react";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import { useContent } from "@/hooks/useContent";
import contentDefaults from "@/data/content.json";

// SEO-relevant, text-heavy sections (about, industries, how-we-work, service area, contact/NAP,
// testimonials, trusted brands) are rendered on the server too. They used to be `ssr: false`, which
// left them out of the HTML that crawlers and slow connections get and made them pop in after
// hydration (layout shift). Only widgets that measure the DOM / format dates stay client-only.
const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const AboutOwnerClean = dynamic(() => import("@/components/AboutOwnerClean"));
const TrustedBrandsSection = dynamic(() => import("@/components/sections/TrustedBrandsSection"));
const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"));
// BlogSection formats publish dates with toLocaleDateString (server/browser timezone can differ).
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"));
const ServiceArea = dynamic(() => import("@/components/ServiceArea"));
const IndustriesSection = dynamic(() => import("@/components/IndustriesSection"));

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

const plain = (v: unknown): string =>
  typeof v === "string" ? v.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim() : "";

/** True when `list` is an array with at least one item that has real text in one of `need`. */
const hasRealItem = (list: unknown, need: string[]): boolean =>
  Array.isArray(list) &&
  list.some((it: any) => it && typeof it === "object" && need.some((k) => plain(it[k]).length > 0));

/** Arrays that make a section "real" (keys to look in) and the fields an item needs to count. */
interface ListSpec {
  keys: string[];
  need: string[];
}

/**
 * Resolves one page section that can be stored under several legacy keys (e.g. `about` /
 * `aboutOwner`). Returns null when ANY alias is explicitly switched off (the editors write
 * `enabled:false` on their own key) or when no alias has content. With a `list` spec the section
 * also needs at least one real item: the shared section components substitute hardcoded DEMO data
 * (fake partner logos, fake reviews, fake case studies, generic worldwide hubs) when their list is
 * empty or holds only blank rows, and a live city page must never show those, so a header with
 * no items stays hidden.
 */
function resolveSection(content: any, aliases: string[], list?: ListSpec): any | null {
  if (aliases.some((k) => content?.[k]?.enabled === false)) return null;
  for (const key of aliases) {
    const section = content?.[key];
    if (!hasContent(section)) continue;
    if (list && !list.keys.some((lk) => hasRealItem(section?.[lk], list.need))) continue;
    return section;
  }
  return null;
}

/**
 * The "featured services" carousel stores a full COPY of each service at the time it was picked
 * (`services.list`), and <Services> prefers that copy over the live catalog. So a service that was
 * later trashed / unpublished / deleted in Admin > Services kept showing on the city page and linked
 * to a /services/<slug>/ URL that 404s, and edits to a service never reached the page. Re-sync
 * against the live catalog the route hands us (`content.globalServices`): drop unpublished or
 * vanished services and overlay the live fields on the saved copy (order is preserved).
 * With no catalog available (e.g. it failed to load) the saved list is used untouched.
 */
function syncServicesWithCatalog(services: any, catalog: any): any {
  if (!services || typeof services !== "object") return services;
  const saved: any[] = Array.isArray(services.list)
    ? services.list
    : Array.isArray(services.services)
      ? services.services
      : [];
  const live: any[] = Array.isArray(catalog) ? catalog.filter((s: any) => s && typeof s === "object") : [];

  const findLive = (item: any) =>
    live.find(
      (s: any) =>
        (item._id && s._id === item._id) ||
        (item.id && (s.id === item.id || s._id === item.id)) ||
        (item.slug && s.slug === item.slug)
    );

  const list: any[] = [];
  for (const item of saved) {
    // Plain ids/slugs are resolved against the catalog by <Services> itself.
    if (!item || typeof item !== "object") {
      if (item) list.push(item);
      continue;
    }
    if (item.isTrashed || item.status === "draft") continue;
    if (live.length > 0) {
      const match = findLive(item);
      if (match) {
        if (match.isTrashed || match.status === "draft") continue;
        list.push({ ...item, ...match });
        continue;
      }
      if (item.slug) continue; // no longer in the catalog -> its page is gone
    }
    list.push(item);
  }
  return { ...services, list };
}

// Coordinates for the cities this site publishes pages/hubs for. <ServiceArea>'s map only geocodes
// countries and states: every other name fell back to 20N/0E (the Sahara) and the big US cities
// that happen to be state aliases all stacked on their state's centre, so hovering a city chip flew
// the map to the wrong place. Keys are lowercase, without the state suffix.
const CITY_COORDS: Record<string, [number, number]> = {
  "houston": [29.7604, -95.3698], "dallas": [32.7767, -96.797], "austin": [30.2672, -97.7431],
  "san antonio": [29.4241, -98.4936], "fort worth": [32.7555, -97.3308], "plano": [33.0198, -96.6989],
  "las vegas": [36.1699, -115.1398], "henderson": [36.0395, -114.9817], "reno": [39.5296, -119.8138],
  "carson city": [39.1638, -119.7674], "carson": [39.1638, -119.7674], "winchester": [36.133, -115.123],
  "denver": [39.7392, -104.9903], "aurora": [39.7294, -104.8319], "boulder": [40.015, -105.2705],
  "brighton": [39.9853, -104.8205], "colorado springs": [38.8339, -104.8214], "springs": [38.8339, -104.8214],
  "casper": [42.8666, -106.3131], "gillette": [44.2911, -105.5022], "sheridan": [44.7972, -106.9562],
  "jackson": [43.4799, -110.7624], "powell": [44.7541, -108.7576], "cheyenne": [41.14, -104.8202],
  "charlotte": [35.2271, -80.8431], "raleigh": [35.7796, -78.6382], "durham": [35.994, -78.8986],
  "asheville": [35.5951, -82.5515], "greensboro": [36.0726, -79.792],
  "columbia": [34.0007, -81.0348], "charleston": [32.7765, -79.9311], "greenville": [34.8526, -82.394],
  "mount pleasant": [32.7941, -79.8626], "rock hill": [34.9249, -81.0251],
};

const cityKey = (name: unknown) =>
  String(name ?? "")
    .toLowerCase()
    .replace(/,.*$/, "")
    .replace(/\s+/g, " ")
    .trim();

/** Gives every hub that has no coordinates of its own the real position of its city (if known). */
function withHubCoordinates(hubs: any[]): any[] {
  return hubs.map((hub: any) => {
    if (!hub || (Number.isFinite(hub.lat) && Number.isFinite(hub.lng))) return hub;
    const c = CITY_COORDS[cityKey(hub.name)];
    return c ? { ...hub, lat: c[0], lng: c[1] } : hub;
  });
}

/**
 * Legacy hub links use "/location/<state>/<city>/", a URL scheme this site does not serve (only
 * /location/ itself exists; every location page lives at /<country>/<state>/<city>/), so those chips
 * 404. Same-site absolute URLs keep their origin.
 */
function fixLegacyLocationLink(link: unknown, countrySlug: string): unknown {
  if (typeof link !== "string") return link;
  const m = link.trim().match(/^(https?:\/\/[^/?#]+)?\/location\/([^/?#]+)\/([^/?#]+)\/?([?#].*)?$/i);
  return m ? `${m[1] || ""}/${countrySlug}/${m[2]}/${m[3]}/${m[4] || ""}` : link;
}

function prepareServiceArea(serviceArea: any, countrySlug: string): any {
  if (!serviceArea || typeof serviceArea !== "object") return serviceArea;
  const hubs = withHubCoordinates(
    (serviceArea.hubs as any[]).map((hub: any) => {
      if (!hub || typeof hub !== "object") return hub;
      const raw = hub.link || hub.href || hub.url;
      const fixed = fixLegacyLocationLink(raw, countrySlug);
      return fixed === raw ? hub : { ...hub, link: fixed };
    })
  );
  return {
    ...serviceArea,
    hubs,
    // <ServiceArea> defaults to "#contact-form", an anchor that only exists on the Contact and
    // Service Detail templates. On a city page the form section is id="contact" (which is also
    // what the editor's own default says).
    ctaHref: serviceArea.ctaHref || serviceArea.ctaLink || "#contact",
  };
}

/** Selected posts (ids, slugs or whole post objects) resolved against the published-posts pool. */
function resolveBlogPosts(cfg: any, pool: any): any[] {
  const selected: any[] = Array.isArray(cfg?.selectedPosts) ? cfg.selectedPosts : [];
  if (selected.length > 0 && selected.every((s: any) => s && typeof s === "object" && s.title)) return selected;

  const posts: any[] = Array.isArray(pool) ? pool : [];
  if (selected.length > 0) {
    const matched = posts.filter((p: any) => {
      const pId = String(p?._id || p?.id || "");
      const pSlug = String(p?.slug || "");
      return selected.some((s: any) => {
        if (typeof s === "string") return s === pId || s === pSlug;
        if (s && typeof s === "object") return String(s._id || s.id || "") === pId || String(s.slug || "") === pSlug;
        return false;
      });
    });
    if (matched.length > 0) return matched;
  }
  // The Blog tab promises "if none are selected, the latest published posts are displayed".
  return posts.slice(0, 4);
}

export default function CityTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { allBlogs } = useContent();
  const content = pageData?.content || {};
  const countrySlug: string = content.countrySlug || "usa";

  const trustedBrands = resolveSection(content, ["trustedBrands", "clientTrust", "trustedBy"], { keys: ["logos", "items"], need: ["name", "image"] });
  const about = resolveSection(content, ["about", "aboutOwner"]);
  const industries = resolveSection(content, ["industries", "domainExpertise"], { keys: ["list", "items", "domains"], need: ["title"] });
  const portfolio = resolveSection(content, ["portfolio"], { keys: ["projects", "caseStudies"], need: ["title", "brand"] });
  const testimonials = resolveSection(content, ["testimonials", "reviews"], { keys: ["list", "items", "testimonials"], need: ["quote", "text"] });
  const whyChooseUs = resolveSection(content, ["whyChooseUs", "howWeWork"], { keys: ["reasons", "features"], need: ["title"] });

  const servicesData = useMemo(
    () => syncServicesWithCatalog(content.services, content.globalServices),
    [content.services, content.globalServices]
  );
  const showServices =
    content.services?.enabled !== false && hasContent(content.services) && Array.isArray(servicesData?.list) && servicesData.list.length > 0;

  const serviceArea = useMemo(() => {
    const sa = content.serviceArea;
    if (!sa || sa.enabled === false || !hasContent(sa) || !hasRealItem(sa.hubs, ["name"])) return null;
    return prepareServiceArea(sa, countrySlug);
  }, [content.serviceArea, countrySlug]);

  const videoTestimonials = content.videoTestimonials;
  const showVideos =
    videoTestimonials?.enabled !== false &&
    Array.isArray(videoTestimonials?.items) &&
    videoTestimonials.items.some((it: any) => it && typeof it.videoUrl === "string" && it.videoUrl.trim());

  const faqsVisible =
    content.faqs?.enabled !== false && content.faqSection?.enabled !== false && hasContent(content.faqs);

  // The Blog tab writes both keys; either one being switched off hides the section.
  const blogConfig = content.blogSection || content.blog;
  const blogEnabled = content.blogSection?.enabled !== false && content.blog?.enabled !== false;
  const blogPosts = useMemo(
    () => (blogEnabled && blogConfig ? resolveBlogPosts(blogConfig, allBlogs) : []),
    [blogEnabled, blogConfig, allBlogs]
  );

  const showContact =
    content.contact?.enabled !== false &&
    content.quote?.enabled !== false &&
    (hasContent(content.contact) || hasContent(content.quote));

  // <ContactForm> spreads the page's contact object over its defaults, so a field the admin left
  // blank (formHeading: "", successTitle: "" ...) used to win over the default text and rendered an
  // empty heading / blank success message. The editor's promise is "leave a field empty to use the
  // default", so blank values are dropped here and the defaults fill in.
  const contactData = useMemo(() => {
    const merged: any = { ...(contentDefaults as any).contact };
    for (const [k, v] of Object.entries(content.contact || {})) {
      if (typeof v === "string" && !v.trim()) continue;
      merged[k] = v;
    }
    return merged;
  }, [content.contact]);

  const showHero = content.hero?.enabled !== false && hasContent(content.hero);

  return (
    <div className="relative">
      {/* 1. Hero Section (carries the breadcrumb and the page's only <h1>) */}
      {showHero ? (
        <Hero data={content.hero} breadcrumb={<PageBreadcrumbs page={pageData} />} />
      ) : (
        // Hero switched off: the fixed navbar would sit on top of the first section, and the
        // breadcrumb + <h1> would disappear with it, so keep both.
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-28 md:pt-32">
          <PageBreadcrumbs page={pageData} />
          <h1 className="sr-only">{(pageData?.title || content.city || "").trim()}</h1>
        </div>
      )}

      {/* 1.5 Trusted Brands */}
      {trustedBrands && <TrustedBrandsSection data={trustedBrands} />}

      {/* 1.6 Video Testimonials */}
      {showVideos && (
        <section id="video-testimonials">
          <VideoTestimonials data={videoTestimonials} />
        </section>
      )}

      {/* 2. About The Owner (Clean - No stats, No CTA button) */}
      {about && <AboutOwnerClean data={about} />}

      {/* 3. Services Section */}
      {showServices && <Services data={servicesData} masterCatalog={content.globalServices} />}

      {/* 3.5 Industries We Serve */}
      {industries && <IndustriesSection data={industries} />}

      {/* 4. Selected Portfolio Projects */}
      {portfolio && <Portfolio data={portfolio} />}

      {/* 5. Reviews / Testimonials */}
      {testimonials && <Testimonials data={testimonials} />}

      {/* 6. How We Work / Value Props */}
      {whyChooseUs && <HowWeWork data={whyChooseUs} />}

      {/* 7. Service Area (nearby cities / areas served, on the map) */}
      {serviceArea && <ServiceArea data={serviceArea} />}

      {/* 8. FAQ Section */}
      {faqsVisible && (
        <PageInlineFaqs
          faqs={content.faqs}
          faqSchemaMarkup={content.faqSchemaMarkup}
          badge={content.faqBadge}
          title={content.faqTitleHighlight || content.faqTitle}
          description={content.faqDescription}
          data={content}
        />
      )}

      {/* 9. Blog Section */}
      {blogPosts.length > 0 && (
        <BlogSection
          title={blogConfig.title}
          subtitle={blogConfig.subtitle}
          description={blogConfig.description}
          data={blogConfig}
          posts={blogPosts}
        />
      )}

      {/* 10. CTA Contact Form */}
      {showContact && <ContactForm data={contactData} />}
    </div>
  );
}
