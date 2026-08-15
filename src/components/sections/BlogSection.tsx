"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RichTextRenderer from "../ui/RichTextRenderer";

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    featuredImage?: string;
    excerpt?: string;
    publishedAt: string;
    author?: string | { name: string };
}

interface BlogSectionProps {
    title?: string;
    subtitle?: string;
    description?: string;
    posts: BlogPost[];
    viewAllLink?: string;
}

const hasTextContent = (str?: string) => {
    if (!str) return false;
    const clean = str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
    return clean.length > 0;
};

export default function BlogSection({ 
    title, 
    subtitle, 
    description,
    posts = [],
    viewAllLink = "/blog"
}: BlogSectionProps) {
    if (!posts || posts.length === 0) return null;

    const displayTitle = hasTextContent(title) ? title! : "Latest from the Blog";
    const displaySubtitle = hasTextContent(subtitle) ? subtitle! : "Insights & News";
    const displayDescription = hasTextContent(description) ? description! : "Stay updated with the latest trends, tips, and news from the roofing and construction industry.";

    const words = displayTitle.trim().split(/\s+/);
    let mainTitle = "";
    let lastWord = "";
    if (words.length > 0) {
        lastWord = words[words.length - 1];
        mainTitle = words.slice(0, -1).join(" ");
    }

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-br from-primary/10 to-transparent blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-gradient-to-tr from-primary/10 to-transparent blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(var(--primary)) 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="w-8 sm:w-12 h-px bg-primary/30" />
                            <span className="text-[8px] xs:text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary">
                                {displaySubtitle}
                            </span>
                            <div className="w-8 sm:w-12 h-px bg-primary/30" />
                        </div>
                        <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-3 sm:mb-4">
                            {mainTitle}{" "}
                            {lastWord && (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                                    {lastWord}
                                </span>
                            )}
                        </h2>
                        <div className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                            <RichTextRenderer content={displayDescription} stripParagraphs={true} />
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, idx) => (
                        <motion.article
                            key={post._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
                        >
                            <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden no-underline hover:no-underline">
                                {post.featuredImage ? (
                                    <Image 
                                        src={post.featuredImage} 
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </Link>

                            <div className="p-8">
                                <div className="flex items-center gap-4 text-[11px] text-muted-foreground uppercase tracking-wider mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-primary" />
                                        <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-primary" />
                                        <span>5 min read</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300 no-underline">
                                    <Link href={`/blog/${post.slug}`} className="no-underline text-foreground group-hover:text-primary transition-colors duration-300">
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                                    {post.excerpt || (post as any).content?.substring(0, 150).replace(/<[^>]*>?/gm, '') + "..."}
                                </p>

                                <Link 
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest group/link no-underline hover:no-underline"
                                >
                                    Read Article
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* View All Posts Button */}
                <div className="mt-12 sm:mt-16 flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link href={viewAllLink} className="no-underline hover:no-underline">
                            <div className="group relative overflow-hidden px-8 py-4 rounded-2xl inline-flex items-center justify-center gap-2.5 text-sm font-bold uppercase tracking-wider bg-primary text-white border border-primary/30 transition-all duration-300 active:scale-[0.98] hover:text-white shadow-lg shadow-primary/10 hover:shadow-primary/20 cursor-pointer">
                                <span className="relative z-10">View All Posts</span>
                                <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
