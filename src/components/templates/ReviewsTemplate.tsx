"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Icon } from "../../config/icons";
import { useContent } from "../../hooks/useContent";
import Image from "next/image";
import RichTextRenderer from "../ui/RichTextRenderer";
import PageInlineFaqs from "@/components/PageInlineFaqs";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=450&fit=crop&q=80";
const GOOGLE_MAPS_REVIEW_URL = "https://maps.app.goo.gl/PbvRBs4tJsDAJVMy6";

const getVideoThumbnail = (videoId: string) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

const Counter = ({ value, suffix = "", start = false, isDecimal = false }: any) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = 0;
        const duration = 1500;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 4);
            if (isDecimal) { setCount(Number((easedProgress * value).toFixed(1))); }
            else { setCount(Math.floor(easedProgress * value)); }
            if (progress < 1) { requestAnimationFrame(animate); }
        };
        requestAnimationFrame(animate);
    }, [start, value, isDecimal]);
    return <span>{isDecimal ? count.toFixed(1) : count}{suffix}</span>;
};

const TestimonialCard = ({ testimonial, index, onPlay }: any) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.1 }} className="group relative bg-white dark:bg-card rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-white/5 transition-all duration-300">
            <div className="absolute top-6 right-6 text-5xl text-primary/10 font-serif">"</div>
            <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" /></svg>
                ))}
            </div>
            <div className="text-gray-700 dark:text-foreground/80 text-sm sm:text-base leading-relaxed mb-6 line-clamp-5 italic">
                <RichTextRenderer content={testimonial.text} stripParagraphs={true} />
            </div>
            <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-foreground text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.position}, {testimonial.company}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default function ReviewsTemplate({ pageData, params }: { pageData?: any, params?: any }) {
    const { testimonials: data } = useContent();
    const { section, testimonials = [], videos = [], stats = {} as any } = data || {};
    const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);

    return (
        <main className="relative min-h-screen bg-gray-50 dark:bg-background pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h1 className="text-4xl sm:text-7xl font-bold tracking-tight mb-4" dangerouslySetInnerHTML={{ __html: section?.headline || 'Customer Stories' }} />
                <div className="text-lg text-gray-600 max-w-xl mx-auto mb-12">
                    <RichTextRenderer content={section?.description} stripParagraphs={true} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    {testimonials.map((item: any, i: number) => (
                        <TestimonialCard key={i} testimonial={item} index={i} />
                    ))}
                </div>
            </div>

        </main>
    );
}
