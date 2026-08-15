"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Layout, TreePine, Building2, Building, Droplets, ArrowRight, Shield, Clock, Award, Users, TrendingUp, BadgeCheck, Star, ChevronRight } from 'lucide-react';
import { useContent } from "../../hooks/useContent";
import RichTextRenderer from "../ui/RichTextRenderer";
import BlogSection from "../sections/BlogSection";
import PageInlineFaqs from "@/components/PageInlineFaqs";

const iconMap: Record<string, any> = { Home, Layout, TreePine, Building2, Building, Droplets, Shield, Award, Clock, BadgeCheck, TrendingUp, Star };

const ServiceCard = ({ service, index }: any) => {
    const slug = service.slug || service.title.toLowerCase().replace(/ & /g, '-').replace(/, /g, '-').replace(/ /g, '-');
    const Icon = iconMap[service.icon] || Shield;
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group">
            <Link href={`/services/${slug}`} className="block h-full">
                <div className="relative h-full bg-card border border-border rounded-2xl p-6 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300">
                            <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-5 group-hover:text-primary transition-colors">{service.title}</h2>
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                            Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default function ServicesTemplate({ pageData, params }: { pageData?: any, params?: any }) {
    const { services: dataRaw, allBlogs, blogSection, faq } = useContent();
    const data = dataRaw as any;
    const services = (data?.services || []).filter((s: any) => s.status === 'published' || s.status === undefined);

    // Use services.headline if available
    const headline = data?.headline;
    const headlineJsx = headline
        ? typeof headline === 'string'
            ? <span>{headline}</span>
            : (
                <span>
                    {headline.prefix}{' '}
                    <span className="text-primary">{headline.highlight}</span>{' '}
                    {headline.suffix}
                </span>
            )
        : <span>Our Services</span>;

    return (
        <main className="min-h-screen bg-background pt-24 pb-16">

            <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 mb-6"
                >
                    <Star className="w-4 h-4 fill-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">{data?.badge || "What We Do"}</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-7xl font-bold mb-6 leading-tight"
                >
                    {headlineJsx}
                </motion.h1>
                {data?.description && (
                    <div className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        <RichTextRenderer content={Array.isArray(data.description) ? data.description[0] : data.description} />
                    </div>
                )}
            </div>
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service: any, index: number) => (
                    <ServiceCard key={index} service={service} index={index} />
                ))}
            </div>
            <PageInlineFaqs 
                faqs={(pageData?.content?.faqs && pageData.content.faqs.length > 0) ? pageData.content.faqs : faq.items} 
                faqSchemaMarkup={pageData?.content?.faqSchemaMarkup || pageData?.faqSchemaMarkup} 
                badge={pageData?.content?.faqBadge}
                title={pageData?.content?.faqTitle}
                subtitle={pageData?.content?.faqDescription}
            />

            <BlogSection
                title={pageData?.content?.blogSection?.title || blogSection?.title}
                subtitle={pageData?.content?.blogSection?.subtitle || blogSection?.subtitle}
                description={pageData?.content?.blogSection?.description || blogSection?.description}
                posts={allBlogs.filter((p: any) => (pageData?.content?.blogSection?.selectedPosts || blogSection?.selectedPosts || []).includes(p._id))}
            />

        </main>
    );
}
