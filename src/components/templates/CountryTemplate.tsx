"use client";

import { useMemo } from "react";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import contentDefaults from "@/data/content.json";
import { useContent } from "@/hooks/useContent";
import { cleanMojibake } from "@/lib/utils";

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

// Keys that only configure a block (visibility switch, icon choice, ids, ring %, star
// rating, marquee row, ...). They never count as "content": an item/section whose only
// filled-in fields are these would render as an empty default-looking block.
const CONFIG_KEYS = new Set([
  "enabled", "id", "_id", "icon", "iconName", "primary", "column", "rating", "avatarBg", "percentage", "speed", "videoType",
]);

// Rich-text editors save an emptied field as "<p><br></p>" / "<p>&nbsp;</p>" - not real content.
const isBlankText = (s: string) => {
  if (/<img\b/i.test(s)) return false;
  return !s.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;| /gi, " ").trim();
};
const str = (v: any): string => (typeof v === "string" ? v.trim() : "");
const plain = (v: any): string => (typeof v === "string" && !isBlankText(v) ? v.trim() : "");

// True when a section holds at least one real, human-written value. Whitespace-only strings,
// empty rich text, bare numbers/booleans and pure settings (CONFIG_KEYS) do not count, so a
// section the admin never filled in - or only toggled - stays hidden instead of rendering the
// component's built-in demo copy on a page that is meant to be isolated from Home.
function hasContent(obj: any): boolean {
  if (!obj) return false;
  if (typeof obj === "string") return !isBlankText(obj);
  if (Array.isArray(obj)) return obj.some(hasContent);
  if (typeof obj === "object") {
    if (obj.enabled === false) return false;
    return Object.entries(obj).some(([k, v]) => !CONFIG_KEYS.has(k) && hasContent(v));
  }
  return false;
}

// The editor writes the first key; the second is a legacy alias older documents may still carry.
const pick = (primary: any, legacy?: any) => (primary != null ? primary : legacy);

const isLive = (s: any) => s && (s.status === undefined || s.status === "published") && !s.isTrashed;

// Same normalisation useContent() applies to context data: Cloudinary images go through the
// site's /cdn-images proxy (see next.config.ts) and mojibake is repaired. This template hands
// the page's own content to the components as props (it never goes through useContent()), so
// without this the Country page loaded images straight from res.cloudinary.com.
const CLOUDINARY = /https:\/\/res\.cloudinary\.com\/dytytwyp6\/image\/upload\//g;
function normalizeStrings(v: any): any {
  if (typeof v === "string") {
    return cleanMojibake(v.includes("res.cloudinary.com/dytytwyp6") ? v.replace(CLOUDINARY, "/cdn-images/") : v);
  }
  if (Array.isArray(v)) return v.map(normalizeStrings);
  if (v && typeof v === "object") {
    const out: any = {};
    for (const k in v) out[k] = normalizeStrings(v[k]);
    return out;
  }
  return v;
}

// ContactForm merges `content.json defaults < page contact < data`, and a blank string in the
// page's contact object (e.g. a cleared "Form Card Heading") beats the default - the form then
// rendered an empty heading / empty "sending" label / empty success title while the editor
// placeholder promised the default text. Resolve blanks to the defaults here.
function resolveContact(contact: any) {
  const filled: Record<string, any> = {};
  Object.entries(contact || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || (typeof v === "string" && !v.trim())) return;
    filled[k] = v;
  });
  return { ...(contentDefaults as any).contact, ...filled };
}

// Testimonials.tsx fills any empty one of its 3 marquee rows with hard-coded demo reviews
// (invented people at invented companies), which is what a page with only 1-2 real reviews
// showed. Keep only real reviews and make sure every row has at least one of them.
function resolveReviews(t: any) {
  if (!t) return null;
  const source = [t.list, t.items, t.testimonials].find((a) => Array.isArray(a) && a.length > 0) || [];
  const real = source
    .filter((r: any) => r && (str(r.name) || plain(r.quote ?? r.text)))
    .map((r: any) => ({ ...r, quote: r.quote ?? r.text, role: r.role ?? r.position }));
  if (real.length === 0) return null;
  const rowsCovered = [1, 2, 3].every((c) => real.some((r: any) => Number(r.column) === c));
  const list =
    real.length >= 3
      ? real.map((r: any, i: number) => ({ ...r, column: rowsCovered ? Number(r.column) : (i % 3) + 1 }))
      : [0, 1, 2].map((i) => ({ ...real[i % real.length], column: i + 1 }));
  return { ...t, list, items: undefined, testimonials: undefined };
}

// Mirrors how Services.tsx matches a saved card to the live service catalog.
const sameService = (a: any, b: any): boolean =>
  !!(
    (a?._id && b?._id && String(a._id) === String(b._id)) ||
    (a?.id && (String(b?.id) === String(a.id) || String(b?._id) === String(a.id))) ||
    (a?.slug && b?.slug === a.slug) ||
    (typeof a === "string" && [b?._id, b?.id, b?.slug, b?.title].some((x) => x && String(x) === a)) ||
    (a?.title && b?.title && String(b.title).toLowerCase() === String(a.title).toLowerCase())
  );

export default function CountryTemplate({ pageData }: { pageData?: any; params?: any }) {
  const { allBlogs } = useContent();
  const content = useMemo(() => normalizeStrings(pageData?.content || {}), [pageData?.content]);
  const pageTitle = str(pageData?.title);

  // ── Hero ──────────────────────────────────────────────────────────────────────
  const hero = content.hero;
  const showHero = hero?.enabled !== false && hasContent(hero);

  // Hero.tsx falls back to ANOTHER business's copy when these are blank ("Roofing, Siding,
  // Windows, Decks" marquee, "VETERAN OWNED" ring text, a generic title/description) and always
  // draws the badge pill, even empty. Resolve them here so a Country page only ever shows its
  // own text, the page title, or brand-neutral text.
  let heroData: any = null;
  if (showHero) {
    const marquee = (Array.isArray(hero.marqueeItems) ? hero.marqueeItems : []).map((s: any) => str(s)).filter(Boolean);
    const liveServices = (Array.isArray(content.globalServices) ? content.globalServices : []).filter(
      (s: any) => s?.title && isLive(s)
    );
    const line1 = hero.titleLine1 !== undefined ? hero.titleLine1 : hero.headline ?? "";
    const line2 = hero.titleLine2 !== undefined ? hero.titleLine2 : hero.headlineHighlight ?? "";
    const bothTitlesBlank = !str(line1) && !str(line2);
    heroData = {
      ...hero,
      // never render an empty <h1>: fall back to the page title
      titleLine1: bothTitlesBlank ? pageTitle : line1,
      titleLine2: line2,
      description: hero.description ?? "",
      badge: str(hero.badge ?? hero.badgeText) || pageTitle,
      circleText: str(hero.circleText) || "MOHSIN DESIGNS • CREATIVE POWER •",
      marqueeItems: marquee.length
        ? marquee
        : liveServices.length
          ? liveServices.slice(0, 8).map((s: any) => s.title)
          : [pageTitle].filter(Boolean),
    };
  }

  // ── Section data (each editor tab writes the first key; the rest are legacy aliases) ──
  const trusted = pick(content.trustedBrands, pick(content.clientTrust, content.trustedBy));
  const trustedLogos = Array.isArray(trusted?.logos) && trusted.logos.length > 0 ? trusted.logos : trusted?.items;
  const showTrusted =
    trusted?.enabled !== false &&
    hasContent(trusted) &&
    Array.isArray(trustedLogos) &&
    trustedLogos.some((l: any) => str(l?.name) || str(l?.image));

  const videoItems: any[] = Array.isArray(content.videoTestimonials?.items) ? content.videoTestimonials.items : [];
  const showVideo = content.videoTestimonials?.enabled !== false && videoItems.some((it: any) => str(it?.videoUrl));

  const about = pick(content.about, content.aboutOwner);
  const aboutData = about && {
    ...about,
    // AboutOwnerClean shows a hard-coded first-person bio ("I help brands scale dynamically...")
    // when the narrative is blank; an empty paragraph keeps that out of a Country page.
    description: plain(about.description) || about.bioParagraph1 || about.bioParagraph2 ? about.description : "<p></p>",
  };

  // Services: the cards saved in the editor are copies made at selection time. Drop the ones the
  // live catalog no longer has (deleted / draft / trashed) instead of showing a stale card that
  // links to a 404. (`content.globalServices` is always the live catalog - see [...slug]/page.tsx.)
  const services = content.services;
  const catalog: any[] = Array.isArray(content.globalServices) ? content.globalServices : [];
  const savedCards: any[] = services?.list || services?.services || [];
  const serviceCards =
    catalog.length === 0
      ? savedCards
      : savedCards.filter((c: any) => {
          const live = catalog.find((s: any) => sameService(c, s));
          return !!live && live.status !== "draft" && !live.isTrashed;
        });

  const industries = pick(content.industries, content.domainExpertise);

  const portfolio = content.portfolio;
  const portfolioItems: any[] = portfolio?.projects || portfolio?.caseStudies || [];

  const reviewsSource = pick(content.testimonials, content.reviews);
  const reviews = reviewsSource?.enabled === false ? null : resolveReviews(reviewsSource);

  const whyChoose = pick(content.whyChooseUs, content.howWeWork);

  // Country -> states listing: the regional hubs (name + focus + page link) authored in the
  // "Global Coverage" tab. Without hubs ServiceArea would list its 12 built-in countries
  // (US, Canada, UK, ...) on someone's country page, so it needs at least one named hub.
  const serviceArea = content.serviceArea;
  const hubs = Array.isArray(serviceArea?.hubs) ? serviceArea.hubs.filter((h: any) => str(h?.name)) : [];
  // ServiceArea's own blank-CTA fallback is "#contact-form", which does not exist on the page
  // (the contact section's anchor is #contact) - resolve it here.
  const serviceAreaData = serviceArea && {
    ...serviceArea,
    hubs,
    ctaHref: str(serviceArea.ctaHref) || str(serviceArea.ctaLink) || "#contact",
  };

  // FAQs: an "+ Add FAQ" row that was never filled in still carries category "GENERAL", which
  // used to be enough to show the section with a "Frequently Asked Question" row and no answer.
  const faqs = (Array.isArray(content.faqs) ? content.faqs : []).filter(
    (f: any) => f && str(f.question) && plain(f.answer)
  );

  // Blog: the editor mirrors its settings into both `blogSection` and `blog` (and its
  // visibility switch into both), and promises "if none are selected, the latest published
  // posts are automatically displayed". Only render once the posts have loaded so the
  // component's built-in demo articles never flash in.
  const blog = pick(content.blogSection, content.blog);
  const blogOff = content.blogSection?.enabled === false || content.blog?.enabled === false;
  const blogPool: any[] = Array.isArray(allBlogs) ? allBlogs : [];
  const selectedIds: any[] = Array.isArray(blog?.selectedPosts) ? blog.selectedPosts : [];
  const selectedPosts = blogPool.filter((p: any) =>
    selectedIds.some((s: any) => {
      const key = typeof s === "string" ? s : String(s?._id || s?.id || s?.slug || "");
      return !!key && (key === String(p._id || p.id || "") || key === String(p.slug || ""));
    })
  );
  const blogPosts = selectedPosts.length > 0 ? selectedPosts : blogPool.slice(0, 4);
  const showBlog = !blogOff && hasContent(blog) && blogPosts.length > 0;

  // Contact: gate on the contact block itself (the legacy `quote` object holds no rendered fields).
  const contact = content.contact;
  const showContact = contact?.enabled !== false && content.quote?.enabled !== false && hasContent(contact);

  return (
    // With no hero the first section would sit under the fixed navbar (the hero normally
    // provides that top offset).
    <div className={`relative ${showHero ? "" : "pt-24 md:pt-32"}`}>
      {/* 1. Hero Section */}
      {showHero && <Hero data={heroData} breadcrumb={<PageBreadcrumbs page={pageData} />} />}

      {/* No hero: keep the crumbs and a real page <h1> (screen-reader/SEO only) */}
      {!showHero && (
        <>
          {pageTitle && <h1 className="sr-only">{pageTitle}</h1>}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pb-4">
            <PageBreadcrumbs page={pageData} />
          </div>
        </>
      )}

      {/* 1.5 Trusted Brands - needs at least one logo (the component's built-in list is Google, Stripe, AWS ... shown as if they were clients) */}
      {showTrusted && <TrustedBrandsSection data={trusted} />}

      {/* 1.6 Video Testimonials */}
      {showVideo && (
        <section id="video-testimonials">
          <VideoTestimonials data={content.videoTestimonials} />
        </section>
      )}

      {/* 2. About The Owner (Clean - No stats, No CTA button) */}
      {about?.enabled !== false && hasContent(about) && <AboutOwnerClean data={aboutData} />}

      {/* 3. Services Section - needs at least one selected, still-live service, otherwise it is an empty carousel */}
      {services?.enabled !== false && hasContent(services) && serviceCards.length > 0 && (
        <Services data={{ ...services, list: serviceCards }} masterCatalog={content.globalServices} />
      )}

      {/* 3.5 Industries We Serve (was the only section without a content check -> default demo cards on every page) */}
      {industries?.enabled !== false && hasContent(industries) && <IndustriesSection data={industries} />}

      {/* 4. Selected Portfolio Projects - Portfolio.tsx invents demo case studies when none are selected */}
      {portfolio?.enabled !== false && hasContent(portfolio) && portfolioItems.length > 0 && (
        <Portfolio data={portfolio} />
      )}

      {/* 5. Reviews / Testimonials */}
      {reviews && <Testimonials data={reviews} />}

      {/* 6. How We Work / Value Props */}
      {whyChoose?.enabled !== false && hasContent(whyChoose) && <HowWeWork data={whyChoose} />}

      {/* 7. Service Area (Country coverage & regional hubs) */}
      {serviceArea?.enabled !== false && hubs.length > 0 && <ServiceArea data={serviceAreaData} />}

      {/* 8. FAQ Section */}
      {content.faqSection?.enabled !== false && faqs.length > 0 && (
        <PageInlineFaqs
          faqs={faqs}
          faqSchemaMarkup={content.faqSchemaMarkup}
          badge={content.faqBadge}
          title={content.faqTitleHighlight || content.faqTitle}
          description={content.faqDescription}
          data={content}
        />
      )}

      {/* 9. Blog Section */}
      {showBlog && (
        <BlogSection
          title={blog.title}
          subtitle={blog.subtitle}
          description={blog.description}
          data={blog}
          posts={blogPosts}
        />
      )}

      {/* 10. CTA Contact Form */}
      {showContact && <ContactForm data={resolveContact(contact)} />}
    </div>
  );
}
