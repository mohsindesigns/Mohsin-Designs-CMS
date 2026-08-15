"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import AggressiveRoofingSection from "@/components/RoofingExperts";
import Services from "@/components/Services";


const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Leadership = dynamic(() => import("@/components/Leadership"));
const BrandStore = dynamic(() => import("@/components/BrandStore"), { ssr: false });
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: false });
const HowWeWork = dynamic(() => import("@/components/HowWeWork"), { ssr: false });
const QAForm = dynamic(() => import("@/components/QAForm"), { ssr: false });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: false });
const QuickQuote = dynamic(() => import("@/components/QuickQuote"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"), { ssr: false });

import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";

export default function HomeTemplate({ pageData, params }: { pageData?: any, params?: any }) {
  const { allBlogs, blogSection } = useContent();
  return (
    <div className="relative">
      <Hero />
      <section id="roofingexperts">
        <AggressiveRoofingSection />
      </section>
      <section id="services">
        <Services />
      </section>
      <section id="leadership">
        <Leadership />
      </section>
      <section id="portfolio">
        <Portfolio />
      </section>
      <BrandStore />
      <Testimonials />
      <section id="about">
        <HowWeWork />
      </section>
      <section id="contact">
        <QAForm />
      </section>


       <BlogSection
        title={pageData?.content?.blogSection?.title || blogSection?.title}
        subtitle={pageData?.content?.blogSection?.subtitle || blogSection?.subtitle}
        description={pageData?.content?.blogSection?.description || blogSection?.description}
        posts={allBlogs.filter((p: any) => (pageData?.content?.blogSection?.selectedPosts || []).includes(p._id))}
      />

      <QuickQuote />

    </div>
  );
}

