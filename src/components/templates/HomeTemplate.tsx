"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";

const TrustedBrandsSection = dynamic(() => import("@/components/sections/TrustedBrandsSection"), { ssr: false });
const AboutOwner = dynamic(() => import("@/components/AboutOwner"), { ssr: false });
const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"), { ssr: false });
const IndustriesSection = dynamic(() => import("@/components/IndustriesSection"), { ssr: false });
const ServiceArea = dynamic(() => import("@/components/ServiceArea"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"));

export default function HomeTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { allBlogs, blogSection, faq } = useContent();

  const blogData = pageData?.content?.blogSection || pageData?.content?.blog || blogSection;
  const selectedBlogIds = blogData?.selectedPosts || [];

  // Match selected posts by string ID, ObjectID, slug, or if selectedBlogIds contains full post objects
  let resolvedPosts: any[] | undefined = undefined;

  if (Array.isArray(selectedBlogIds) && selectedBlogIds.length > 0) {
    if (selectedBlogIds.every((s: any) => typeof s === 'object' && s && s.title)) {
      resolvedPosts = selectedBlogIds;
    } else if (Array.isArray(allBlogs) && allBlogs.length > 0) {
      const matched = allBlogs.filter((p: any) => {
        const pId = String(p._id || p.id || '');
        const pSlug = String(p.slug || '');
        return selectedBlogIds.some((s: any) => {
          if (typeof s === 'string') return s === pId || s === pSlug;
          if (typeof s === 'object' && s) return String(s._id || s.id || '') === pId || String(s.slug || '') === pSlug;
          return false;
        });
      });
      if (matched.length > 0) resolvedPosts = matched;
    }
  }

  if (!resolvedPosts && Array.isArray(allBlogs) && allBlogs.length > 0) {
    resolvedPosts = allBlogs.slice(0, 4);
  }

  const content = pageData?.content || {};

  return (
    <div className="relative">
      {content.hero?.enabled !== false && <Hero />}

      {/* ── TRUSTED BY LEADING BRANDS MARQUEE ── */}
      {(content.trustedBrands?.enabled !== false && content.clientTrust?.enabled !== false && content.trustedBy?.enabled !== false) && (
        <section id="trusted-brands">
          <TrustedBrandsSection data={content.trustedBrands || content.clientTrust || content.trustedBy} />
        </section>
      )}

      {content.aboutOwner?.enabled !== false && (
        <section id="about">
          <AboutOwner />
        </section>
      )}

      {content.services?.enabled !== false && (
        <section id="services">
          <Services data={content.services} />
        </section>
      )}

      {/* Industries We Serve Section */}
      {(content.industries?.enabled !== false && content.domainExpertise?.enabled !== false) && (
        <section id="industries">
          <IndustriesSection data={content.industries || content.domainExpertise} />
        </section>
      )}

      {content.portfolio?.enabled !== false && (
        <section id="portfolio">
          <Portfolio />
        </section>
      )}

      {(content.testimonials?.enabled !== false && content.reviews?.enabled !== false) && (
        <Testimonials />
      )}

      {(content.howWeWork?.enabled !== false && content.whyChooseUs?.enabled !== false) && (
        <section id="how-we-work">
          <HowWeWork />
        </section>
      )}

      {content.serviceArea?.enabled !== false && (
        <section id="service-area">
          <ServiceArea />
        </section>
      )}

      {(content.faqs?.enabled !== false && content.faqSection?.enabled !== false) && (
        <section id="faq">
          <PageInlineFaqs
            faqs={content.faqs}
            faqSchemaMarkup={content.faqSchemaMarkup}
            badge={content.faqBadge}
            title={content.faqTitleHighlight || content.faqTitle}
            description={content.faqDescription}
            data={content}
          />
        </section>
      )}

      {/* Blog Section */}
      {blogData?.enabled !== false && (
        <section id="blog">
          <BlogSection
            title={blogData?.title}
            subtitle={blogData?.subtitle || blogData?.sectionTag}
            description={blogData?.description}
            data={blogData}
            posts={resolvedPosts}
          />
        </section>
      )}

      {/* Direct Contact Form Section */}
      {content.contact?.enabled !== false && (
        <section id="contact">
          <ContactForm data={content.contact} />
        </section>
      )}
    </div>
  );
}

