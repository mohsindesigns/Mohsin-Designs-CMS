import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useState, useCallback, useMemo, memo } from "react";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import Link from "next/link";
import EagleAboutImg from "@/assets/fairabout.png";
import RichTextRenderer from "./ui/RichTextRenderer";

const Counter = memo(({ value, suffix = "", duration = 1.8 }: { value: number; suffix?: string; duration?: number }) => {
    const ref = useRef(null);
    // Coerce value to a safe number — DB may return strings or null
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : parseFloat(String(value)) || 0;
    const [display, setDisplay] = useState(0);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const shouldReduceMotion = useReducedMotion();
    const hasAnimatedRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!inView || hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;

        if (shouldReduceMotion) {
            setDisplay(safeValue);
            return;
        }

        let startTime: number;
        const startValue = 0;
        const endValue = safeValue;
        const durationMs = duration * 1000;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(startValue + (endValue - startValue) * eased);
            setDisplay(current);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplay(endValue);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [inView, safeValue, duration, shouldReduceMotion]);

    return (
        <span ref={ref} className="tabular-nums">
            {(display ?? 0).toLocaleString()}
            {suffix}
        </span>
    );
});

Counter.displayName = "Counter";

const ParticlesBackground = memo(() => {
    const particlesInit = useCallback(async (engine: any) => {
        const { loadSlim } = await import("tsparticles-slim");
        await loadSlim(engine);
    }, []);

    const options = useMemo(
        () => ({
            fullScreen: { enable: false },
            particles: {
                number: {
                    value: 12,
                    density: { enable: true, area: 800 },
                },
                color: { value: ["hsl(var(--primary))", "hsl(var(--primary)/80)"] },
                shape: { type: "circle" },
                opacity: {
                    value: 0.15,
                    random: true,
                    animation: { enable: true, speed: 0.5, minimumValue: 0.05 },
                },
                size: {
                    value: { min: 0.5, max: 2 },
                    random: true,
                    animation: { enable: true, speed: 2, minimumValue: 0.5 },
                },
                move: {
                    enable: true,
                    speed: 0.3,
                    direction: "top" as const,
                    random: true,
                    straight: false,
                    outModes: { default: "out" as const },
                },
                links: {
                    enable: true,
                    distance: 150,
                    color: "hsl(var(--primary))",
                    opacity: 0.1,
                    width: 0.5,
                },
            },
            detectRetina: true,
            fpsLimit: 30,
        }),
        []
    );

    const [ParticlesComponent, setParticlesComponent] = useState<any>(null);

    useEffect(() => {
        import("react-tsparticles").then((module) => {
            setParticlesComponent(() => module.default);
        });
    }, []);

    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { margin: "200px" });

    if (!ParticlesComponent) return null;

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none">
            {isInView && (
                <ParticlesComponent
                    id="roofing-particles"
                    init={particlesInit}
                    options={options}
                    className="w-full h-full"
                />
            )}
        </div>
    );
});

ParticlesBackground.displayName = "ParticlesBackground";

const StatCard = memo(({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-card p-4 rounded-2xl border border-border shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
        >
            <div className="relative">
                <span className="text-3xl md:text-4xl font-black text-primary">
                    <Counter value={value} suffix={suffix} />
                </span>
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary rounded-full" />
            </div>
            <p className="text-xs md:text-sm font-semibold text-muted-foreground mt-3">{label}</p>
        </motion.div>
    );
});

StatCard.displayName = "StatCard";

export default function AboutSection() {
    const { about } = useContent();
    const sectionRef = useRef<HTMLElement>(null);
    const shouldReduceMotion = useReducedMotion();

    const {
        badge = "",
        headline = { prefix: "", highlight: "", suffix: "" },
        description = "",
        image = {},
        stats = [],
        buttons = [],
        trustBadges = [],
        coreValues = []
    } = about || {};

    const isDynamicImage = !!(image?.src && (image.src.startsWith('/') || image.src.startsWith('http')));
    const isCloudinaryOrUnsplash = !!(image?.src && (image.src.includes('res.cloudinary.com') || image.src.includes('images.unsplash.com')));
    const shouldBeUnoptimized = isDynamicImage && image.src.startsWith('http') && !isCloudinaryOrUnsplash;

    const variants = useMemo(
        () => ({
            hidden: { opacity: 0, y: 30 },
            visible: (custom: number) => ({
                opacity: 1,
                y: 0,
                transition: {
                    delay: custom * 0.15,
                    duration: 0.7,
                    ease: "easeOut" as const,
                },
            }),
        }),
        []
    );

    return (
        <section
            ref={sectionRef}
            className="relative bg-background overflow-hidden py-12 md:py-14 lg:py-16"
            aria-label="About Eagle Revolution"
        >
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none rotate-180">
                <svg
                    viewBox="0 0 1440 120"
                    className="relative block w-full h-[50px] sm:h-[70px] md:h-[90px]"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="premium-divider-header" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#premium-divider-header)"
                        d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
                    />
                </svg>
            </div>

            <div className="absolute inset-0">
                <ParticlesBackground />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.02)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--primary)/0.02)_0%,_transparent_50%)]" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' patternUnits='userSpaceOnUse' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='hsl(var(--primary))' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {!shouldReduceMotion && (
                <>
                    <motion.div
                        animate={{
                            x: [0, 40, 0],
                            y: [0, -40, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 2,
                        }}
                        className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl"
                    />
                </>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
                    <motion.div
                        variants={variants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        custom={0}
                        className="relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-300/50">
                            <div className="relative aspect-[4/5] lg:aspect-[3/4]">
                                {isDynamicImage && (image.src.startsWith('http') || image.src.startsWith('/uploads') || image.src.startsWith('/cdn-images')) ? (
                                    <img
                                        src={image.src}
                                        alt={image.alt || "About Eagle Revolution"}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : isDynamicImage ? (
                                    <Image
                                        src={image.src}
                                        alt={image.alt || "About Eagle Revolution"}
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        fill
                                        quality={100}
                                        priority
                                        loading="eager"
                                        unoptimized={shouldBeUnoptimized}
                                    />
                                ) : (
                                    <Image
                                        src={EagleAboutImg}
                                        alt={image?.alt || "About Eagle Revolution"}
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        fill
                                        quality={100}
                                        priority
                                        loading="eager"
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />

                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.6 }}
                                    className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6"
                                >
                                    <div className="bg-card/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-xl border border-border">
                                        <span className="flex items-center gap-2 text-sm font-bold text-primary">
                                            {image?.badge || "Veteran Owned & Operated"}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={variants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        custom={1}
                        className="space-y-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10"
                        >
                            <span className="text-primary text-lg">⚡</span>
                            {badge && (
                                <span className="text-primary uppercase tracking-[0.2em] text-xs sm:text-sm font-bold">{badge}</span>
                            )}
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight"
                            >
                                <span className="block text-foreground">{headline.prefix}</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">{headline.highlight}</span>
                                <span className="block text-foreground">{headline.suffix}</span>
                            </motion.h2>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="w-24 h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-full origin-left"
                            />
                        </div>

                        <div className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                            <RichTextRenderer content={description} stripParagraphs={true} />
                        </div>

                        {coreValues && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.55, duration: 0.6 }}
                                className="flex flex-wrap gap-2 pt-2"
                            >
                                {coreValues.map((value: string, i: number) => (
                                    <span
                                        key={`value-${i}`}
                                        className="px-3 py-1.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full border border-secondary/20"
                                    >
                                        {value}
                                    </span>
                                ))}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="pt-2 w-full"
                        >
                            <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 w-full">
                                {buttons.map((button: any, idx: number) =>
                                    button.primary ? (
                                        <Link key={`btn-p-${idx}`} href={button.href}>
                                            <motion.div
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="group relative overflow-hidden flex-1 sm:flex-initial min-w-[150px] sm:min-w-[180px] px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl inline-flex items-center justify-center gap-2 bg-primary text-white border border-primary font-semibold sm:font-bold text-sm sm:text-base shadow-primary/90 transition-all duration-300 hover:bg-primary hover:border-primary hover:text-white hover:shadow-primary/50 cursor-pointer"
                                            >
                                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/20 via-transparent to-white/10 transition-opacity duration-300" />
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {button.text}
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </span>
                                            </motion.div>
                                        </Link>
                                    ) : (
                                        <Link key={`btn-s-${idx}`} href={button.href}>
                                            <motion.div
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="group relative overflow-hidden flex-1 sm:flex-initial min-w-[150px] sm:min-w-[180px] px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl inline-flex items-center justify-center gap-2 bg-white text-[#333333] border-2 border-primary font-semibold sm:font-bold text-sm sm:text-base shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-primary/50 cursor-pointer"
                                            >
                                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/10 via-transparent to-white/5 transition-opacity duration-300" />
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {button.text}
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </span>
                                            </motion.div>
                                        </Link>
                                    )
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                            className="grid grid-cols-3 gap-4 pt-8"
                        >
                            {stats.map((stat: any, idx: number) => (
                                <StatCard key={`stat-${idx}`} {...stat} />
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
                <svg
                    viewBox="0 0 1440 120"
                    className="relative block w-full h-[50px] sm:h-[70px] md:h-[90px]"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="premium-divider-footer" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#premium-divider-footer)"
                        d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
                    />
                </svg>
            </div>
        </section>
    );
};