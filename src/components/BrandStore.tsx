// BrandStore.tsx - Fixed with proper contrast
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Icon } from "../config/icons";

export default function BrandStore() {
    const containerRef = useRef(null);
    const [scrollTarget, setScrollTarget] = useState<any>(undefined);
    useEffect(() => {
        setScrollTarget(containerRef);
    }, []);

    const { scrollYProgress } = useScroll({
        target: scrollTarget,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    const storeUrl = "https://gbrandusa.chipply.com/eaglerevolution/?action=viewall";

    return (
        <section
            ref={containerRef}
            className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background py-6"
        >
            {/* Premium Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_hsl(var(--primary)/0.05)_0%,_transparent_70%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            {/* Floating Orbs */}
            <motion.div
                animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-[10%] w-24 h-24 rounded-full bg-primary/15 blur-[50px] pointer-events-none"
            />
            <motion.div
                animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-10 left-[10%] w-32 h-32 rounded-full bg-primary/10 blur-[60px] pointer-events-none"
            />

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                {/* Premium Badge - Fixed contrast */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 bg-card border border-primary/20 px-5 py-2.5 rounded-full mb-10 shadow-lg"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.15em] uppercase text-primary">Official Store • Limited Collection</span>
                </motion.div>

                {/* Main Headline - Fixed visibility */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-6"
                >
                    <motion.h2
                        initial={{ y: 80 }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                        className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter"
                    >
                        <span className="text-foreground">REP THE</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">REVOLUTION</span>
                    </motion.h2>
                </motion.div>

                {/* Subtitle - Fixed contrast */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-10"
                >
                    <motion.p
                        initial={{ y: 40 }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
                        className="text-card-foreground/70 text-base md:text-lg max-w-lg mx-auto"
                    >
                        Premium hoodies • Tees • Hats • Bags
                        <br />
                        Made to order • Veteran owned
                    </motion.p>
                </motion.div>

                {/* CTA Button - Fixed hover effect */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                >
                    <motion.a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative inline-flex items-center gap-3 px-10 py-4 bg-primary text-white hover:text-white font-bold rounded-full  transition-all duration-300 text-base"
                    >
                        <span>Shop Official Gear</span>
                        <Icon name="ArrowRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                </motion.div>



                {/* Scroll indicator - Now visible */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-2 mt-16"
                >
                    <span className="text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase font-mono">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [4, 12, 4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-2 bg-primary rounded-full mt-1"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}