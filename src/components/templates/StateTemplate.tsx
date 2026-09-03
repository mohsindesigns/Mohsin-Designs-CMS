"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import { useContent } from "@/hooks/useContent";

const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const AboutOwnerClean = dynamic(() => import("@/components/AboutOwnerClean"), { ssr: false });
const TrustedBrandsSection = dynamic(() => import("@/components/sections/TrustedBrandsSection"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"), { ssr: false });
const QAForm = dynamic(() => import("@/components/QAForm"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"), { ssr: false });
const ServiceArea = dynamic(() => import("@/components/ServiceArea"), { ssr: false });

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

export default function StateTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { allBlogs } = useContent();
  const content = pageData?.content || {};

  return (
    <div className="relative">
      {/* 1. Hero Section */}
      {content.hero?.enabled !== false && hasContent(content.hero) && <Hero data={content.hero} />}

      {/* 1.5 Trusted Brands */}
      {(content.trustedBrands?.enabled !== false && content.clientTrust?.enabled !== false && content.trustedBy?.enabled !== false) && 
        (hasContent(content.trustedBrands) || hasContent(content.clientTrust) || hasContent(content.trustedBy)) && (
        <TrustedBrandsSection data={content.trustedBrands || content.clientTrust || content.trustedBy} />
      )}

      {/* 2. About The Owner (Clean - No stats, No CTA button) */}
      {(content.about?.enabled !== false && content.aboutOwner?.enabled !== false) && 
        (hasContent(content.about || content.aboutOwner)) && (
        <section id="about">
          <AboutOwnerClean data={content.about || content.aboutOwner} />
        </section>
      )}

      {/* 3. Services Section */}
      {content.services?.enabled !== false && hasContent(content.services) && (
        <section id="services">
          <Services data={content.services} />
        </section>
      )}

      {/* 3. Selected Portfolio Projects */}
      {content.portfolio?.enabled !== false && hasContent(content.portfolio) && (
        <section id="portfolio">
          <Portfolio data={content.portfolio} />
        </section>
      )}

      {/* 4. Reviews / Testimonials */}
      {(content.testimonials?.enabled !== false && content.reviews?.enabled !== false) && 
        (hasContent(content.testimonials) || hasContent(content.reviews)) && (
        <Testimonials data={content.testimonials || content.reviews} />
      )}

      {/* 5. How We Work / Value Props */}
      {(content.whyChooseUs?.enabled !== false && content.howWeWork?.enabled !== false) && 
        (hasContent(content.whyChooseUs || content.howWeWork)) && (
        <section id="how-we-work">
          <HowWeWork data={content.whyChooseUs || content.howWeWork} />
        </section>
      )}

      {/* 6. Service Area (State & Metro cities) */}
      {content.serviceArea?.enabled !== false && hasContent(content.serviceArea) && (
        <section id="service-area">
          <ServiceArea data={content.serviceArea} />
        </section>
      )}

      {/* 7. FAQ Section */}
      {(content.faqs?.enabled !== false && content.faqSection?.enabled !== false) && hasContent(content.faqs) && (
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
      {content.blogSection?.enabled !== false && content.blogSection && Array.isArray(content.blogSection.selectedPosts) && content.blogSection.selectedPosts.length > 0 && (
        <BlogSection
          title={content.blogSection.title}
          subtitle={content.blogSection.subtitle}
          description={content.blogSection.description}
          data={content.blogSection}
          posts={allBlogs ? allBlogs.filter((p: any) => content.blogSection.selectedPosts.includes(p._id)) : []}
        />
      )}

      {/* 9. CTA Contact Form */}
      {(content.contact?.enabled !== false && content.quote?.enabled !== false) && 
        (hasContent(content.contact) || hasContent(content.quote)) && (
        <section id="contact">
          <ContactForm data={content.contact} />
        </section>
      )}
    </div>
  );
}
