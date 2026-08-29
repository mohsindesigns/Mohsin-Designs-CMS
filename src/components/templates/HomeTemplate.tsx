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

  const blogData = pageData?.content?.blogSection || pageData?.content?.blog;
  const selectedBlogIds = blogData?.selectedPosts || [];

  const resolvedPosts = (Array.isArray(selectedBlogIds) && selectedBlogIds.length > 0)
    ? (allBlogs ? allBlogs.filter((p: any) => {
        return selectedBlogIds.includes(p._id) || 
               selectedBlogIds.includes(p.id) || 
               selectedBlogIds.includes(p.slug) || 
               selectedBlogIds.some((s: any) => (typeof s === 'object' && (s._id === p._id || s.id === p._id || s.slug === p.slug)));
      }) : [])
    : (allBlogs && allBlogs.length > 0 ? allBlogs.slice(0, 4) : undefined);

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

