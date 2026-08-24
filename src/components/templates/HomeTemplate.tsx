"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import AggressiveRoofingSection from "@/components/RoofingExperts";
import Services from "@/components/Services";


const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Leadership = dynamic(() => import("@/components/Leadership"));
const BrandStore = dynamic(() => import("@/components/BrandStore"), { ssr: false });
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const AboutOwner = dynamic(() => import("@/components/AboutOwner"), { ssr: false });
const ContactForm = dynamic(() => import("@/components/ContactForm"));
const QAForm = dynamic(() => import("@/components/QAForm"), { ssr: false });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: false });
const QuickQuote = dynamic(() => import("@/components/QuickQuote"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"), { ssr: false });
const ServiceArea = dynamic(() => import("@/components/ServiceArea"), { ssr: false });

import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";

export default function HomeTemplate({ pageData, params }: { pageData?: any, params?: any }) {
  const { allBlogs, blogSection, faq } = useContent();
  return (
    <div className="relative">
      <Hero />
      <section id="about">
        <AboutOwner />
      </section>


      <section id="services">
        <Services />
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

      {pageData?.content?.blogSection && Array.isArray(pageData.content.blogSection.selectedPosts) && pageData.content.blogSection.selectedPosts.length > 0 && (
        <BlogSection
          title={pageData.content.blogSection.title}
          subtitle={pageData.content.blogSection.subtitle}
          description={pageData.content.blogSection.description}
          data={pageData.content.blogSection}
          posts={allBlogs ? allBlogs.filter((p: any) => pageData.content.blogSection.selectedPosts.includes(p._id)) : []}
        />
      )}

      {/* Direct Contact Form Section */}
      <section id="contact">
        <ContactForm data={pageData?.content?.contact} />
      </section>
    </div>
  );
}

