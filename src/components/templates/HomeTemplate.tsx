"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";

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

  return (
    <div className="relative">
      <Hero />
      <section id="about">
        <AboutOwner />
      </section>

      <section id="services">
        <Services />
      </section>

      {/* Industries We Serve Section */}
      <section id="industries">
        <IndustriesSection data={pageData?.content?.industries || pageData?.content?.domainExpertise} />
      </section>

      <section id="portfolio">
        <Portfolio />
      </section>

      <Testimonials />

      <section id="how-we-work">
        <HowWeWork />
      </section>

      <section id="service-area">
        <ServiceArea />
      </section>

      <section id="faq">
        <PageInlineFaqs
          faqs={pageData?.content?.faqs}
          faqSchemaMarkup={pageData?.content?.faqSchemaMarkup}
          badge={pageData?.content?.faqBadge}
          title={pageData?.content?.faqTitleHighlight || pageData?.content?.faqTitle}
          description={pageData?.content?.faqDescription}
          data={pageData?.content}
        />
      </section>

      {/* Blog Section */}
      <section id="blog">
        <BlogSection
          title={blogData?.title}
          subtitle={blogData?.subtitle || blogData?.sectionTag}
          description={blogData?.description}
          data={blogData}
          posts={resolvedPosts}
        />
      </section>

      {/* Direct Contact Form Section */}
      <section id="contact">
        <ContactForm data={pageData?.content?.contact} />
      </section>
    </div>
  );
}

