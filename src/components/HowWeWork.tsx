import { useRef, useEffect, useState } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useSpring,
    useTransform
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import Link from "next/link";
import RichTextRenderer from "./ui/RichTextRenderer";

gsap.registerPlugin(ScrollTrigger);

// Custom icons for WhyChooseUs section since they're not in lucide-react
const CustomIcons = {
    Veteran: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    ),
    Experience: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" strokeLinecap="round" />
        </svg>
    ),
    Warranty: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L15 9H22L17 14L19 21L12 17L5 21L7 14L2 9H9L12 2Z" />
        </svg>
    ),
    Financing: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8M12 8v8" />
        </svg>
    ),
    Certified: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L3 7v7c0 5.5 9 8 9 8s9-2.5 9-8V7l-9-5z" />
            <path d="M8 12l3 3 5-5" strokeLinecap="round" />
        </svg>
    ),
    Community: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
};

// Helper function to get the correct icon
const getFeatureIcon = (iconName: string) => {
    // Try custom icons first
    if (CustomIcons[iconName as keyof typeof CustomIcons]) {
        return CustomIcons[iconName as keyof typeof CustomIcons];
    }
    // Fallback to lucide icons
    return () => <Icon name={iconName} className="w-10 h-10" />;
};

const CinematicBackground = ({ isClient }: { isClient: boolean }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
                className="absolute top-20 left-20 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]"
                animate={{
                    x: [0, 100, 0, -50, 0],
                    y: [0, -50, 100, 50, 0],
                    scale: [1, 1.2, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]"
                animate={{
                    x: [0, -100, 50, -30, 0],
                    y: [0, 50, -50, 30, 0],
                    scale: [1, 0.8, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-30" />


            {isClient && [...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-px h-px bg-primary/30"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.5, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const inView = useInView(cardRef, { once: true, margin: "-100px" });

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });
    const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = (cardRef.current as HTMLElement).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = (mouseX / rect.width - 0.5) * 0.4;
        const yPct = (mouseY / rect.height - 0.5) * 0.4;
        x.set(xPct);
        y.set(yPct);
        setMousePosition({ x: mouseX, y: mouseY });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    // Get the correct icon component
    const FeatureIcon = getFeatureIcon(feature?.icon || "CheckCircle");

    return (
        <motion.article
            ref={cardRef}
            initial={{ opacity: 0, y: 100 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 2000,
            }}
            className="relative group h-full cursor-pointer"
        >
            <div className="relative h-full bg-card overflow-hidden rounded-2xl border border-border">
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary)/0.03), transparent 60%)`,
                    }}
                />

                <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{
                        x: isHovered ? '100%' : '-100%',
                        opacity: isHovered ? 1 : 0
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{
                        x: isHovered ? '-100%' : '100%',
                        opacity: isHovered ? 1 : 0
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                />

                <motion.div
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"
                    initial={{ height: 0, top: '50%' }}
                    animate={{
                        height: isHovered ? '100%' : 0,
                        top: isHovered ? 0 : '50%'
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />

                <motion.div
                    className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary/30"
                    initial={{ height: 0, top: '50%' }}
                    animate={{
                        height: isHovered ? '100%' : 0,
                        top: isHovered ? 0 : '50%'
                    }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                />

                <motion.div
                    className="absolute top-0 right-0 w-16 h-16"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                >
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary" />
                </motion.div>

                <motion.div
                    className="absolute bottom-0 left-0 w-16 h-16"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary" />
                </motion.div>

                {isHovered && (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full bg-primary/40"
                                initial={{
                                    x: mousePosition.x,
                                    y: mousePosition.y,
                                    scale: 0,
                                    opacity: 0.6
                                }}
                                animate={{
                                    x: mousePosition.x + (Math.random() - 0.5) * 150,
                                    y: mousePosition.y + (Math.random() - 0.5) * 150,
                                    scale: [0, 1.5, 0],
                                    opacity: [0, 0.4, 0]
                                }}
                                transition={{
                                    duration: 1,
                                    delay: i * 0.15,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </>
                )}

                <div className="relative h-full p-8 flex flex-col z-10">
                    <div className="relative mb-6">
                        <div className="relative w-20 h-20">
                            <motion.div
                                className="absolute inset-0 border"
                                animate={{
                                    borderColor: isHovered ? 'hsl(235, 70%, 48%)' : 'rgba(36, 48, 210, 0.2)',
                                    scale: isHovered ? 1.05 : 1
                                }}
                                transition={{ duration: 0.3 }}
                            />

                            <motion.div
                                className="absolute inset-2 border border-primary/10"
                                animate={{ rotate: isHovered ? 45 : 0 }}
                                transition={{ duration: 0.5 }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{
                                        scale: isHovered ? 1.1 : 1,
                                        color: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--primary))'
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="text-primary"
                                >
                                    <FeatureIcon />
                                </motion.div>
                            </div>
                        </div>

                        <motion.div
                            className="absolute -top-2 -right-2 text-primary"
                            animate={{
                                rotate: isHovered ? 360 : 0,
                                scale: isHovered ? 1.2 : 0.8,
                                opacity: isHovered ? 1 : 0.3
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <Icon name="Sparkles" className="w-4 h-4" />
                        </motion.div>
                    </div>

                    <div className="mb-4">
                        <h3 className={`
              text-xl md:text-2xl font-bold mb-3 transition-colors duration-300
              ${isHovered ? 'text-primary' : 'text-card-foreground'}
            `}>
                            {feature.title}
                        </h3>

                        <motion.div
                            className="h-[2px] bg-gradient-to-r from-primary to-primary/30 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: isHovered ? '60px' : 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        />
                    </div>

                    <RichTextRenderer
                        content={feature?.description || ""}
                        className="text-sm md:text-base text-muted-foreground leading-relaxed flex-1"
                    />

                    <motion.div
                        className="absolute bottom-4 right-4 text-7xl font-black text-muted-foreground/20 select-none"
                        animate={{
                            scale: isHovered ? 1.1 : 1,
                            color: isHovered ? 'hsl(var(--primary)/0.1)' : 'hsl(var(--muted-foreground)/0.05)'
                        }}
                    >
                        {(index + 1).toString().padStart(2, '0')}
                    </motion.div>

                    <motion.div
                        className="mt-6 flex items-center gap-3"
                        animate={{ x: isHovered ? 5 : 0 }}
                    >
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Explore
                        </span>
                        <motion.div
                            className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden"
                            animate={{
                                backgroundColor: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.1)',
                                width: '28px'
                            }}
                        >
                            <motion.div
                                animate={{ x: isHovered ? 3 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Icon name="ArrowRight" className={`w-3.5 h-3.5 ${isHovered ? 'text-primary-foreground' : 'text-primary'}`} />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    className="absolute inset-0 -z-10"
                    animate={{
                        boxShadow: isHovered
                            ? '20px 20px 40px -20px hsl(var(--primary)/0.3), -20px -20px 40px -20px hsl(var(--primary)/0.1)'
                            : '10px 10px 30px -15px hsl(var(--foreground)/0.1)'
                    }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </motion.article>
    );
};

const StatCounter = ({ value, label, suffix = "", delay = 0 }: { value: string | number; label: string; suffix?: string; delay?: number }) => {
    const ref = useRef(null);
    const [displayValue, setDisplayValue] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    // Extract suffix from value if not provided explicitly (e.g. "500+" -> numeric: 500, suffix: "+")
    let cleanValue = value;
    let autoSuffix = suffix;
    if (typeof value === "string") {
        const match = value.match(/^(\d+)(.*)$/);
        if (match) {
            cleanValue = parseInt(match[1], 10);
            if (!autoSuffix && match[2]) {
                autoSuffix = match[2];
            }
        }
    }

    const numericValue = typeof cleanValue === 'number' ? cleanValue : parseInt(String(cleanValue), 10);
    const isValidNumber = !isNaN(numericValue) && isFinite(numericValue);

    useEffect(() => {
        if (!inView || !isValidNumber) return;

        let startTime: number;
        const duration = 2000;
        const end = numericValue;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(eased * end));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [inView, numericValue, isValidNumber]);

    // If not a valid number, just display the value as is
    if (!isValidNumber) {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="text-center group cursor-pointer"
            >
                <div className="relative inline-block">
                    <motion.div
                        className="text-4xl md:text-5xl font-black text-primary relative z-10"
                        animate={{
                            scale: isHovered ? 1.1 : 1,
                            y: isHovered ? -2 : 0
                        }}
                    >
                        <span>{String(value)}</span>{autoSuffix}
                    </motion.div>
                </div>
                <div className="text-xs font-semibold tracking-wider text-muted-foreground mt-2 uppercase">
                    {label}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="text-center group cursor-pointer"
        >
            <div className="relative inline-block">
                <motion.div
                    className="text-4xl md:text-5xl font-black text-primary relative z-10"
                    animate={{
                        scale: isHovered ? 1.1 : 1,
                        y: isHovered ? -2 : 0
                    }}
                >
                    <span>{displayValue}</span>{autoSuffix}
                </motion.div>

                <motion.div
                    className="absolute inset-0 bg-primary/10 blur-xl"
                    animate={{
                        scale: isHovered ? 1.5 : 1,
                        opacity: isHovered ? 0.5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                />

                <motion.div
                    className="absolute -top-2 -right-2 w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>
            <div className="text-xs font-semibold tracking-wider text-muted-foreground mt-2 uppercase">
                {label}
            </div>
        </motion.div>
    );
};

const AwardCTABanner = () => {
    const { cta } = useContent().whyChooseUs || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mt-20 overflow-hidden"
        >
            <div className="relative bg-card border border-border rounded-2xl">
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rotate-12"
                        animate={{ rotate: [12, 15, 12] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 -rotate-12"
                        animate={{ rotate: [-12, -15, -12] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                </div>

                <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/30" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/30" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/30" />

                <div className="relative px-8 py-16 md:px-20 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-10 z-30">
                    <div className="max-w-2xl">
                        {cta?.badge && cta.badge.trim() !== "" && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2 mb-4"
                            >
                                <span className="w-8 h-[2px] bg-primary" />
                                <span className="text-lg font-bold tracking-[0.3em] uppercase text-primary">
                                    {cta.badge}
                                </span>
                            </motion.div>
                        )}

                        <h3
                            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
                            dangerouslySetInnerHTML={{ __html: cta?.title || "" }}
                        />

                        <RichTextRenderer
                            content={cta?.description || ""}
                            className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg"
                        />

                        <div className="flex items-center gap-6 mt-6">
                            {(cta?.trustBadges || []).map((badge: string, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <span className="text-xs text-muted-foreground">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {(cta?.buttons || []).map((button: any, idx: number) => {
                            const links = ["/contact-us", "/gallery"];

                            return (

                                <Link key={idx} href={links[idx] || "#"}>
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative px-8 py-4 bg-white text-primary border-2 border-primary font-bold rounded-full shadow-sm hover:bg-primary hover:text-white hover:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
                                            {button.text}
                                            <motion.svg
                                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </motion.svg>
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const WhyChooseUs = () => {
    const { whyChooseUs } = useContent();
    const sectionRef = useRef(null);
    const [isClient, setIsClient] = useState(false);

    const { section, features, stats } = whyChooseUs || {};

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!sectionRef.current || !isClient) return;

        const ctx = gsap.context(() => {
            gsap.fromTo('.reveal-text',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, [isClient]);


    // if (!isClient) return null;

    return (
        <section
            ref={sectionRef}
            className="relative bg-background py-20 md:py-24 lg:py-32 overflow-hidden"
            aria-label="Why Choose Eagle Revolution"
        >
            <CinematicBackground isClient={isClient} />

            <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-20">
                <header className="text-center max-w-4xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="reveal-text"
                    >
                        {section?.badge && section.badge.trim() !== "" && (
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="w-16 h-[2px] bg-primary" />
                                <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary">
                                    {section.badge}
                                </span>
                                <div className="w-16 h-[2px] bg-primary" />
                            </div>
                        )}

                        <h2
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
                        >
                            {(section?.headlinePrefix || section?.headlineHighlight || section?.headlineSuffix) ? (
                                <>
                                    {section?.headlinePrefix && (
                                        <span>{section.headlinePrefix} </span>
                                    )}
                                    {section?.headlineHighlight && (
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                                            {section.headlineHighlight}
                                        </span>
                                    )}
                                    {section?.headlineSuffix && (
                                        <span> {section.headlineSuffix}</span>
                                    )}
                                </>
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: section?.headline || "" }} />
                            )}
                        </h2>

                        <RichTextRenderer
                            content={section?.description || ""}
                            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
                            stripParagraphs={true}
                        />
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {(features || []).map((feature: any, index: number) => (
                        <FeatureCard key={`feature-${index}`} feature={feature} index={index} />
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-24">
                    {(stats || []).map((stat: any, index: number) => (
                        <StatCounter
                            key={`stat-${index}`}
                            value={stat?.value || 0}
                            label={stat?.label || ""}
                            suffix={stat?.suffix || ""}
                            delay={0.1 + (index * 0.1)}
                        />
                    ))}
                </div>

                <AwardCTABanner />
            </div>
        </section>
    );
};

export default WhyChooseUs;
