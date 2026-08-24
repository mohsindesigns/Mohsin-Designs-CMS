"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import { useContent } from "@/hooks/useContent";

const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"), { ssr: false });
const QAForm = dynamic(() => import("@/components/QAForm"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"), { ssr: false });
const ServiceArea = dynamic(() => import("@/components/ServiceArea"), { ssr: false });

function hasContent(obj: any): boolean {
  if (!obj) return false;
  if (typeof obj === 'string') return obj.trim().length > 0;
  if (typeof obj === 'number') return true;
  if (typeof obj === 'boolean') return obj;
  if (Array.isArray(obj)) return obj.length > 0 && obj.some(hasContent);
  if (typeof obj === 'object') {
    return Object.values(obj).some(hasContent);
  }
  return false;
}

export default function StateTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { allBlogs } = useContent();
  const content = pageData?.content || {};

  return (
    <div className="relative">
      {/* 1. Hero Section */}
      {hasContent(content.hero) && <Hero />}

      {/* 2. Services Section */}
      {hasContent(content.services) && (
        <section id="services">
          <Services />
        </section>
      )}

      {/* 3. Selected Portfolio Projects */}
      {hasContent(content.portfolio) && (
        <section id="portfolio">
          <Portfolio />
        </section>
      )}

      {/* 4. Reviews / Testimonials */}
      {hasContent(content.testimonials) && <Testimonials />}

      {/* 5. How We Work / Value Props */}
      {hasContent(content.whyChooseUs || content.howWeWork) && (
        <section id="how-we-work">
          <HowWeWork />
        </section>
      )}

      {/* 6. Service Area (State & Metro cities) */}
      {hasContent(content.serviceArea) && (
        <section id="service-area">
          <ServiceArea />
        </section>
      )}

      {/* 7. FAQ Section */}
      {hasContent(content.faqs) && (
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

      {/* 8. Blog Section */}
      {content.blogSection && Array.isArray(content.blogSection.selectedPosts) && content.blogSection.selectedPosts.length > 0 && (
        <BlogSection
          title={content.blogSection.title}
          subtitle={content.blogSection.subtitle}
          description={content.blogSection.description}
          data={content.blogSection}
          posts={allBlogs ? allBlogs.filter((p: any) => content.blogSection.selectedPosts.includes(p._id)) : []}
        />
      )}

      {/* 9. CTA Contact Form */}
      {(hasContent(content.contact) || hasContent(content.quote)) && (
        <section id="contact">
          <ContactForm data={content.contact} />
        </section>
      )}
    </div>
  );
}
