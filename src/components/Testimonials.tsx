import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import RichTextRenderer from "./ui/RichTextRenderer";

gsap.registerPlugin(ScrollTrigger);

const TestimonialCard = ({ testimonial, isActive }: { testimonial: any; isActive?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  if (!testimonial) return null;

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full"
    >
      <motion.div
        className={`
          relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm
          rounded-2xl p-8 lg:p-10
          border transition-all duration-500
          min-h-[400px] lg:min-h-[440px]
          flex flex-col
          ${isActive
            ? 'border-primary/40 shadow-2xl shadow-primary/20'
            : 'border-primary/10 shadow-xl hover:shadow-2xl'
          }
        `}
        animate={{
          boxShadow: isHovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 30px -15px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="mb-6 relative">
          <Icon name="Quote" className="w-12 h-12 text-primary/30" />
        </div>

        <div className="flex-1 mb-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-foreground/90 text-lg lg:text-xl leading-relaxed font-light italic">
            <RichTextRenderer content={testimonial.text} stripParagraphs={true} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-primary/10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 rounded-full blur-md opacity-50" />
              <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold text-lg border border-primary/20">
                {testimonial.avatar && (testimonial.avatar.startsWith('http') || testimonial.avatar.startsWith('/uploads') || testimonial.avatar.startsWith('/cdn-images')) ? (
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                ) : (
                  testimonial.avatar || testimonial.name.charAt(0)
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground text-base lg:text-lg truncate">
                  {testimonial.name}
                </h4>
                <span className="flex-shrink-0">
                  <Icon name="Verified" className="w-5 h-5 text-primary" />
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {testimonial.position}, {testimonial.company}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="Star" className={`w-4 h-4 ${i < (testimonial.rating || 5) ? "text-primary fill-primary" : "text-primary/20 fill-transparent"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary/20" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary/20" />
      </motion.div>
    </motion.div>
  );
};

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: hsl(var(--muted));
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--primary));
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary)/0.8);
  }
`;

const Testimonials = () => {
  const { testimonials: testimonialsData } = useContent();
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const { 
    section = { badge: '', headline: '', description: '', featured: '' }, 
    testimonials = [], 
    stats = { subscribers: '0' } 
  } = testimonialsData || {};

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = scrollbarStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const nextTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 0) {
      autoPlayRef.current = setInterval(() => {
        nextTestimonial();
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, nextTestimonial, testimonials.length]);

  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextTestimonial();
      }, 5000);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal-element',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  if (!isClient) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-background py-20 md:py-28 lg:py-32 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 1px, transparent 1px, transparent 40px),
                repeating-linear-gradient(135deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 1px, transparent 1px, transparent 40px)
              `,
            }}
          />
        </div>

        <motion.div
          animate={{
            x: [0, 100, 0, -100, 0],
            y: [0, -50, 100, 50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -100, 50, 100, 0],
            y: [0, 50, -100, -50, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20 reveal-element">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-primary">
              {section?.badge}
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
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
              <span>{section.headline}</span>
            )}
          </h2>

          <div className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            <RichTextRenderer content={section.description} stripParagraphs={true} />
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-full border border-primary/10">
              <Icon name="Google" className="w-5 h-5" />
              <span className="text-xs text-muted-foreground">{section.featured}</span>
            </div>
            <div className="w-px h-4 bg-primary/20" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name="Star" className="w-4 h-4 text-primary fill-primary" />
              ))}
              <span className="text-xs font-medium text-foreground ml-1">{stats.subscribers}</span>
            </div>
          </div>

          <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-primary/40 mx-auto mt-8 rounded-full" />
        </div>

        {testimonials.length > 0 && (
          <div className="max-w-5xl mx-auto mb-16 lg:mb-20 reveal-element">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <TestimonialCard
                    testimonial={testimonials[activeIndex]}
                    isActive={true}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-primary">
                      {String(activeIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground">/</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {String(testimonials.length).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="w-px h-6 bg-primary/20 mx-2" />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAutoPlay}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-primary/10 hover:border-primary/30 transition-all"
                  >
                    {isAutoPlaying ? <Icon name="Pause" className="w-4 h-4" /> : <Icon name="Play" className="w-4 h-4" />}
                    <span className="text-xs text-muted-foreground">
                      {isAutoPlaying ? 'Auto' : 'Manual'}
                    </span>
                  </motion.button>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full border border-primary/20 bg-card/50 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 flex items-center justify-center"
                  >
                    <Icon name="ChevronLeft" className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full border border-primary/20 bg-card/50 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 flex items-center justify-center"
                  >
                    <Icon name="ChevronRight" className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="absolute -bottom-12 left-0 right-0">
                <div className="flex gap-1 justify-center">
                  {(testimonials as any[]).map((_: any, idx: number) => (
                    <motion.button
                      key={`dot-${idx}`}
                      onClick={() => setActiveIndex(idx)}
                      className="group cursor-pointer"
                    >
                      <div
                        className={`
                          h-1 rounded-full transition-all duration-300
                          ${idx === activeIndex
                            ? 'w-8 bg-primary'
                            : 'w-4 bg-primary/20 group-hover:bg-primary/40'
                          }
                        `}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-primary/10 reveal-element">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 5).map((t: any, i: number) => (
                <motion.div
                  key={`avatar-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-card flex items-center justify-center text-primary text-xs font-medium shadow-sm"
                >
                  {t.avatar && (t.avatar.startsWith('http') || t.avatar.startsWith('/uploads') || t.avatar.startsWith('/cdn-images')) ? (
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    t.avatar || t.name.charAt(0)
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.subscribers}</span> satisfied customers
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Veteran Owned Business</span>
            </div>
            <div className="w-px h-4 bg-primary/20" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name="Star" className="w-4 h-4 text-primary fill-primary" />
              ))}
              <span className="font-semibold text-foreground ml-1">5.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;