"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import contentDefaults from "@/data/content.json";

const TrustedBrandsSection = dynamic(() => import("@/components/sections/TrustedBrandsSection"), { ssr: false });
const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });
const AboutOwner = dynamic(() => import("@/components/AboutOwner"), { ssr: false });
const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"), { ssr: false });
const IndustriesSection = dynamic(() => import("@/components/IndustriesSection"), { ssr: false });
const ServiceArea = dynamic(() => import("@/components/ServiceArea"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"));

const isBlank = (v: any) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/**
 * ContactForm merges `{ built-in defaults, CMS contact, data prop }` with a plain spread, so a
 * field the admin left blank (e.g. `formHeading: ""`) overwrites the built-in default and the form
 * renders an empty heading / empty submit-state label / empty success title. The admin editor
 * shows the default text for a blank field, so make the page do the same: blank -> default.
 */
function resolveContactData(contact: any) {
  if (!contact || typeof contact !== "object") return contact;
  const defaults: Record<string, any> = (contentDefaults as any).contact || {};
  const out: Record<string, any> = { ...contact };
  for (const key of Object.keys(defaults)) {
    if (isBlank(out[key])) out[key] = defaults[key];
  }
  return out;
}

/**
 * The featured-services carousel must show the LIVE catalog, not stale copies. The editor
 * stores whatever the "Featured Services" picker returned (a snapshot of each service at pick
 * time), and <Services> prefers a picked item's own title/description/image over the catalog's,
 * so renaming a service or changing its image in Admin > Services never reached the homepage.
 * Overlay the fresh catalog entry onto every pick (matched the same way <Services> matches:
 * _id / id / slug / title) and, when nothing is picked, show every published service instead of
 * an empty carousel / the stale `services.services` mirror saved on the page document.
 */
function resolveServicesSection(raw: any, masterCatalog: any) {
  const catalog: any[] = Array.isArray(masterCatalog)
    ? masterCatalog.filter((s: any) => s && s.title && s.status !== "draft" && !s.isTrashed)
    : [];
  if (!raw || catalog.length === 0) return raw;

  const fresh = (svc: any, base: any = {}) => ({
    ...base,
    _id: svc._id ?? base._id,
    id: svc.id ?? base.id,
    slug: svc.slug ?? base.slug,
    title: svc.title || base.title,
    category: svc.category || svc.tag || base.category,
    desc:
      svc.desc || svc.description || svc.shortDescription || svc.tagline || svc.hero?.description || base.desc,
    image:
      svc.image || svc.overviewImage || svc.heroImage || svc.featuredImage ||
      svc.hero?.bgImage || svc.hero?.backgroundImage || base.image,
  });

  const picked: any[] = Array.isArray(raw.list) ? raw.list : [];
  if (picked.length === 0) return { ...raw, list: catalog.map((svc) => fresh(svc)) };

  const list = picked.map((item: any) => {
    if (!item || typeof item !== "object") return item; // legacy string picks: <Services> resolves these itself
    const match = catalog.find(
      (s: any) =>
        (item._id && s._id === item._id) ||
        (item.id && (s.id === item.id || s._id === item.id)) ||
        (item.slug && s.slug === item.slug) ||
        (item.title && s.title?.toLowerCase() === String(item.title).toLowerCase())
    );
    return match ? fresh(match, item) : item;
  });
  return { ...raw, list };
}

export default function HomeTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { allBlogs, blogSection, faq } = useContent();

  const content = pageData?.content || {};

  const blogData = content.blogSection || content.blog || blogSection;
  const selectedBlogIds = blogData?.selectedPosts || [];

  // Match selected posts by string ID, ObjectID, slug, or if selectedBlogIds contains full post objects
  let resolvedPosts: any[] | undefined = undefined;

  if (Array.isArray(selectedBlogIds) && selectedBlogIds.length > 0) {
    if (selectedBlogIds.every((s: any) => typeof s === 'object' && s && s.title)) {
      resolvedPosts = selectedBlogIds;
    } else if (Array.isArray(allBlogs) && allBlogs.length > 0) {
      // Keep the order the admin picked them in (a plain allBlogs.filter() would return them in
      // publish-date order instead) and never show the same post twice.
      const matched: any[] = [];
      for (const s of selectedBlogIds) {
        const sId = typeof s === 'string' ? s : String((s && (s._id || s.id)) || '');
        const sSlug = typeof s === 'string' ? s : String((s && s.slug) || '');
        const post = allBlogs.find((p: any) => {
          const pId = String(p._id || p.id || '');
          const pSlug = String(p.slug || '');
          return (!!sId && sId === pId) || (!!sSlug && sSlug === pSlug);
        });
        if (post && !matched.includes(post)) matched.push(post);
      }
      if (matched.length > 0) resolvedPosts = matched;
    }
  }

  if (!resolvedPosts && Array.isArray(allBlogs) && allBlogs.length > 0) {
    resolvedPosts = allBlogs.slice(0, 4);
  }

  // Featured services: fresh catalog data instead of stale picked copies (see resolveServicesSection).
  const servicesData = resolveServicesSection(content.services, content.globalServices);

  // Video testimonials render nothing without at least one video, so don't mount an empty wrapper
  // (or download the section's chunk) for it.
  const hasVideoTestimonials = Array.isArray(content.videoTestimonials?.items) && content.videoTestimonials.items.length > 0;

  // FAQs: the page's own list wins. Otherwise fall back to the global FAQ list, honouring each
  // item's visibility rule from Admin > FAQ (`specific` items only appear on the pages they target).
  const ownFaqs: any[] = Array.isArray(content.faqs) ? content.faqs : [];
  const globalFaqItems: any[] = Array.isArray(faq?.list) ? faq.list : [];
  const visibleGlobalFaqs = globalFaqItems.filter((item: any) =>
    !item?.visibility || item.visibility === 'global' ||
    (item.visibility === 'specific' && Array.isArray(item.targetPages) && item.targetPages.some((p: string) => ['home', 'homepage', '/'].includes(String(p))))
  );
  const homeFaqs = ownFaqs.length > 0 ? ownFaqs : visibleGlobalFaqs;
  // Every global item targets other pages -> nothing to show here (avoid PageInlineFaqs' own unfiltered fallback).
  const faqsHiddenByVisibility = ownFaqs.length === 0 && globalFaqItems.length > 0 && visibleGlobalFaqs.length === 0;

  return (
    <div className="relative">
      {content.hero?.enabled !== false && <Hero />}

      {/* Wrapper ids below are only kept where the inner component has no id of its own; every other
          section component already renders its own <section id="...">, and a second wrapper with the
          same id made #anchor scrolling / getElementById unreliable (duplicate ids). */}

      {/* ── TRUSTED BY LEADING BRANDS MARQUEE ── */}
      {(content.trustedBrands?.enabled !== false && content.clientTrust?.enabled !== false && content.trustedBy?.enabled !== false) && (
        <div id="trusted-brands">
          <TrustedBrandsSection data={content.trustedBrands || content.clientTrust || content.trustedBy} />
        </div>
      )}

      {content.videoTestimonials?.enabled !== false && hasVideoTestimonials && (
        <div id="video-testimonials">
          <VideoTestimonials data={content.videoTestimonials} />
        </div>
      )}

      {/* The About tab's visibility switch writes `about.enabled` (`aboutOwner.enabled` is the legacy key). */}
      {(content.about?.enabled !== false && content.aboutOwner?.enabled !== false) && (
        <AboutOwner />
      )}

      {content.services?.enabled !== false && (
        <Services data={servicesData} masterCatalog={content.globalServices} />
      )}

      {/* Industries We Serve Section */}
      {(content.industries?.enabled !== false && content.domainExpertise?.enabled !== false) && (
        <IndustriesSection data={content.industries || content.domainExpertise} />
      )}

      {content.portfolio?.enabled !== false && (
        <Portfolio />
      )}

      {(content.testimonials?.enabled !== false && content.reviews?.enabled !== false) && (
        <Testimonials />
      )}

      {(content.howWeWork?.enabled !== false && content.whyChooseUs?.enabled !== false) && (
        <HowWeWork />
      )}

      {content.serviceArea?.enabled !== false && (
        <ServiceArea />
      )}

      {/* The FAQ tab's visibility switch writes `faqSection.enabled` (`faqs` is an array, so it can
          never carry an `enabled` flag itself - kept only for legacy `{ enabled, items }` shapes). */}
      {(content.faqs?.enabled !== false && content.faqSection?.enabled !== false) && !faqsHiddenByVisibility && (
        <PageInlineFaqs
          faqs={homeFaqs}
          faqSchemaMarkup={content.faqSchemaMarkup}
          badge={content.faqBadge}
          title={content.faqTitleHighlight || content.faqTitle}
          description={content.faqDescription}
          data={content}
        />
      )}

      {/* Blog Section - the editor mirrors every field to both `blogSection` and `blog`, so either
          `enabled` flag being false hides it (the render data prefers `blogSection`, so checking only
          the first object left a stale `blog.enabled: false` looking "hidden" in the editor but live). */}
      {(blogData?.enabled !== false && content.blogSection?.enabled !== false && content.blog?.enabled !== false) && (
        <BlogSection
          title={blogData?.title}
          subtitle={blogData?.subtitle || blogData?.sectionTag}
          description={blogData?.description}
          data={blogData}
          posts={resolvedPosts}
        />
      )}

      {/* Direct Contact Form Section - ContactForm's own root element already declares
          id="contact" (it's the actual anchor target for #contact links), so this wrapper
          must not repeat it: a duplicate id makes anchor-scroll/getElementById unreliable. The
          editor's "Contact Form" switch writes both `contact.enabled` and `quote.enabled`. */}
      {(content.contact?.enabled !== false && content.quote?.enabled !== false) && (
        <ContactForm data={resolveContactData(content.contact)} />
      )}
    </div>
  );
}
