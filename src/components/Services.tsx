import { useRef, useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import RichTextRenderer from "./ui/RichTextRenderer";
import serviceDetail from "@/assets/fairservice.png";
// import sharedServicesData from "../data/servicesData.json";

gsap.registerPlugin(ScrollTrigger);

const Counter = ({ value, suffix = "" }: { value: number; suffix: string }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    const duration = 2000;
    const startValue = 0;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime!) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value]);

  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
};

const CompactServiceCard = ({ service }: { service: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  if (!service) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-card rounded-xl border border-border hover:border-primary transition-all duration-500 overflow-hidden shadow-md hover:shadow-xl hover:shadow-primary/20 p-6"
    >
      <Link href={`/services/${service.slug || '#'}`} className="absolute inset-0 z-20" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-card pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ duration: 0.4 }}
      />

      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-3xl" />
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <div className="relative">
          <Icon name={service.icon} className="w-8 h-8 text-primary" />
          {isHovered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -inset-1 bg-primary/20 rounded-full blur-sm -z-10"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-lg font-bold text-card-foreground">{service.title}</h4>
            <span className="text-[10px] font-mono tracking-wider text-primary bg-primary/5 px-2 py-1 rounded-full">
              {service.number}
            </span>
          </div>
          <RichTextRenderer
            content={service.description}
            className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
            stripParagraphs={true}
          />
          <motion.div
            className="flex items-center gap-2 mt-3"
            animate={isHovered ? { x: 5 } : { x: 0 }}
          >
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">Learn more</span>
            <motion.span animate={isHovered ? { x: 3 } : { x: 0 }} className="text-primary">
              <Icon name="ArrowRight" className="w-4 h-4" />
            </motion.span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const ServiceCard = ({ service, index }: { service: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 100, damping: 10 });
  const springY = useSpring(y, { stiffness: 100, damping: 10 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = (cardRef.current as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / rect.width - 0.5) * 0.4;
    const yPct = (mouseY / rect.height - 0.5) * 0.4;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000
      }}
      className="relative h-[420px] bg-card rounded-2xl border border-border hover:border-primary transition-all duration-700 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 group"
    >
      <Link href={`/services/${service.slug || '#'}`} className="absolute inset-0 z-20" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-card pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
      />

      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: isHovered
            ? 'inset 0 0 0 2px rgba(36, 48, 210, 0.15), inset 0 0 20px rgba(36, 48, 210, 0.1)'
            : 'inset 0 0 0 0px rgba(36, 48, 210, 0)'
        }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ originX: 0 }}
      />

      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                opacity: 0.6
              }}
              animate={{
                x: [`50%`, `${20 + (i * 25)}%`],
                y: [`50%`, `${10 + (i * 20)}%`],
                scale: [0, 1.5, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            />
          ))}
        </>
      )}

      <div className="relative h-full p-8 flex flex-col z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
            <Icon name={service.icon} className="w-8 h-8 text-primary relative z-10" />
            <motion.div
              className="absolute -inset-2 bg-primary/10 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono tracking-wider text-primary bg-primary/5 px-3 py-1 rounded-full">
              {service.number}
            </span>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="text-[10px] font-bold tracking-wider uppercase text-primary mt-2"
            >
              {service.tag}
            </motion.span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-card-foreground mb-2 leading-tight line-clamp-2">
          {service.title}
        </h3>

        <div className="flex-1">
          <RichTextRenderer
            content={service.description}
            className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-3"
            stripParagraphs={true}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            className="space-y-1.5 mt-2"
          >
            {(service.overviewStats || service.features)?.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                <span className="truncate">{typeof item === 'string' ? item : (item.label || item.text)}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="flex items-center justify-between mt-4 pt-3 border-t border-border"
          animate={isHovered ? { y: 0 } : { y: 5 }}
        >
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">Explore service</span>
          <motion.div className="flex items-center gap-1" animate={isHovered ? { x: 5 } : { x: 0 }}>
            <Icon name="ArrowRight" className={`w-4 h-4 transition-colors ${isHovered ? 'text-primary' : 'text-muted-foreground'}`} />
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 right-0 w-20 h-20 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-3xl" />
      </div>
    </motion.div>
  );
};

const Services = () => {
  const { services: servicesData } = useContent();
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<any>(undefined);

  useEffect(() => {
    setIsClient(true);
    setScrollTarget(sectionRef);
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 350,
    damping: 28,
    restDelta: 0.001
  });

  const clipPathLeftToRight = useTransform(
    smoothProgress,
    [0, 0.1],
    ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  const imageScale = useTransform(smoothProgress, [0, 0.1], [1.15, 1]);
  const overlayOpacity = useTransform(smoothProgress, [0, 0.08], [0.5, 0.1]);

  const {
    badge = "Premium Services",
    headline = { prefix: 'Our', highlight: 'Expert', suffix: 'Services' },
    description: rawDescription = "Professional exterior remodeling with military precision.",
    highlightText = "",
    stats = [
      { value: 500, suffix: "+", label: "Projects" },
      { value: 50, suffix: "+", label: "Years Combined" },
      { value: 4.9, suffix: "", label: "Rating" }
    ],
    cta = { title: 'Ready to Start?', description: 'Get your free estimate today.', buttonText: 'Contact Us', buttonLink: '/contact-us' }
  } = (servicesData || {}) as any;

  const description = Array.isArray(rawDescription)
    ? rawDescription
    : typeof rawDescription === 'string'
      ? [rawDescription]
      : [];

  const servicesListRaw = (
    servicesData?.services ||
    (Array.isArray(servicesData) ? servicesData : []) ||
    []
  ).filter((s: any) => !s.status || s.status === 'published');

  const servicesList = servicesListRaw.map((s: any, idx: number) => ({
    ...s,
    number: String(idx + 1).padStart(2, '0')
  }));

  // Robust featured service selection
  const featuredService = servicesList.length > 0 ? servicesList[0] : null;
  const gridServices = servicesList.length > 1 ? servicesList.slice(1) : servicesList;



  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.split-text',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out",
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
      className="relative bg-background overflow-hidden py-20 md:py-24"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,_hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,_hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-24">
          <div className="lg:col-span-5 flex flex-col h-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col h-full"
            >
              <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-6 w-fit">
                <Icon name="Award" className="w-4 w-4 text-primary" />
                <span className="text-primary uppercase tracking-wider text-xs font-semibold">
                  {badge}
                </span>
              </div>

              <div className="overflow-hidden mb-6">
                <h2 className="split-text text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                  {headline.prefix}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                    {headline.highlight}
                  </span>
                  <br />
                  <span className="text-foreground">{headline.suffix}</span>
                </h2>
              </div>

              <div className="overflow-hidden mt-2">
                <RichTextRenderer
                  content={description}
                  className="text-muted-foreground text-lg leading-relaxed"
                  stripParagraphs={false}
                />
                {highlightText && (
                  <div className="mt-4">
                    <span className="font-semibold text-primary text-lg">
                      {highlightText}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-8 mt-8 pt-6 border-t border-border">
                {stats.map((stat: any, idx: number) => (
                  <div key={idx} className="flex-1 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary whitespace-nowrap">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {featuredService ? (
                <div className="mt-8">
                  <CompactServiceCard service={featuredService} />
                </div>
              ) : (
                <div className="mt-8 p-6 rounded-xl border border-dashed border-border/40 text-center">
                  <p className="text-muted-foreground text-sm">Select a featured service in the dashboard</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="relative h-full flex items-center">
              <div className="relative w-full">
                <motion.div
                  className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/15"
                  style={{ clipPath: clipPathLeftToRight }}
                >
                  <div className="relative aspect-[4/5]">
                    <motion.div
                      className="absolute inset-0 w-full h-full"
                      style={{ scale: imageScale }}
                    >
                      {servicesData.image?.src ? (
                        servicesData.image.src.startsWith('http') || servicesData.image.src.startsWith('/uploads') || servicesData.image.src.startsWith('/cdn-images') ? (
                          <img
                            src={servicesData.image.src}
                            alt={servicesData.image.alt || "Eagle Revolution Services"}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Image
                            src={servicesData.image.src}
                            alt={servicesData.image.alt || "Eagle Revolution Services"}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                          />
                        )
                      ) : (
                        <Image
                          src={serviceDetail}
                          alt="Eagle Revolution Services"
                          fill
                          className="object-cover"
                          priority
                          quality={100}
                        />
                      )}
                    </motion.div>

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent"
                      style={{ opacity: overlayOpacity }}
                    />
                  </div>
                </motion.div>

                <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />
                <div className="absolute -top-4 -left-4 w-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-0.5 bg-gradient-to-r from-primary to-primary/60" />
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">
              Exterior Remodeling Services
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridServices.map((service: any, index: number) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{cta.title}</h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {cta.description}
          </p>
          <Link href={cta.buttonLink}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:text-white"
            >
              {cta.buttonText}
            </motion.div>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 60"
          className="relative block w-full h-10 md:h-12"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#redGradient)"
            d="M0,24L60,26.7C120,29,240,34,360,34C480,34,600,29,720,26.7C840,24,960,24,1080,26.7C1200,29,1320,34,1380,36.7L1440,39L1440,60L1380,60C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60L0,60Z"
          />
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Services;