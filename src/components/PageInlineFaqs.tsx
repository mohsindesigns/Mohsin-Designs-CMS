"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  AnimatePresence
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import Link from "next/link";
import Script from "next/script";
import RichTextRenderer from "./ui/RichTextRenderer";

gsap.registerPlugin(ScrollTrigger);

// ── Background ────────────────────────────────────────────────────────────────

const SubtleBackground = () => (
  <div className="absolute inset-0 pointer-events-none">
    {/* Soft blur bubble for a premium subtle layout detail without harsh color breaks */}
    <motion.div
      animate={{
        x: [0, 20, 0, -20, 0],
        y: [0, -15, 25, 15, 0],
      }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute top-40 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
    />
  </div>
);

const FloatingParticles = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "100px" });

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {isInView &&
        [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
    </div>
  );
};

// ── Accordion Item ─────────────────────────────────────────────────────────────

const AccordionItem = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: any;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 30, damping: 10 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 10 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = (buttonRef.current as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(50);
    mouseY.set(50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="relative group"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#liquidGradient)"
          opacity={isHovered ? 0.08 : 0.03}
          style={{
            x: useTransform(springX, [0, 100], [-5, 5]),
            y: useTransform(springY, [0, 100], [-5, 5]),
          }}
          transition={{ duration: 0.2 }}
        />
        <defs>
          <radialGradient id="liquidGradient">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </radialGradient>
        </defs>
      </svg>

      <motion.div
        className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:block"
        animate={
          isHovered
            ? { x: -5, scale: 1.1, opacity: 0.8 }
            : { x: 0, scale: 1, opacity: 0.4 }
        }
        transition={{ duration: 0.2 }}
      >
        <span
          className={`
            text-[90px] font-black leading-none tracking-tighter
            ${isOpen ? "text-primary/15" : "text-muted-foreground/20"}
            transition-colors duration-300
          `}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </motion.div>

      <div
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={`
          relative bg-card/90 backdrop-blur-sm rounded-2xl
          border transition-all duration-300
          ${isOpen
            ? "border-primary/30 shadow-2xl shadow-primary/15"
            : "border-primary/10 hover:border-primary/20 shadow-lg shadow-primary/5"
          }
        `}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            fill="none"
            stroke="url(#borderGradient)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              isHovered
                ? { pathLength: 1, opacity: 0.6 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary)/80)" />
            </linearGradient>
          </defs>
        </svg>

        {isHovered && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full z-20"
                style={{
                  background:
                    i % 2 === 0
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary)/80)",
                  boxShadow: `0 0 8px ${i % 2 === 0
                    ? "hsl(var(--primary))"
                    : "hsl(var(--primary)/80)"
                    }`,
                }}
                initial={{ x: "50%", y: "50%", scale: 0, opacity: 0.6 }}
                animate={{
                  x: ["50%", `${20 + i * 10}%`],
                  y: ["50%", `${15 + i * 12}%`],
                  scale: [0, 2, 0],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}

        <button
          onClick={() => onToggle(index)}
          className="w-full text-left p-7 md:p-9 focus:outline-none relative z-10"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between gap-6">
            <h3
              className={`
                text-base md:text-lg lg:text-xl font-light transition-all duration-300 w-full
                ${isOpen
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-medium"
                  : "text-card-foreground group-hover:text-card-foreground/90"
                }
              `}
            >
              <RichTextRenderer content={item.question} className="inline-block rich-text-question text-left" stripParagraphs={true} />
            </h3>

            <div className="relative flex-shrink-0">
              <motion.div
                animate={
                  isOpen
                    ? {
                      rotate: 180,
                      scale: 1.1,
                      backgroundColor: "rgb(36, 48, 210)",
                      borderColor: "rgb(36, 48, 210)",
                    }
                    : {
                      rotate: 0,
                      scale: 1,
                      backgroundColor: "rgb(255, 255, 255)",
                      borderColor: isHovered
                        ? "rgb(36, 48, 210)"
                        : "rgb(230, 230, 230)",
                    }
                }
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full border-2
                  flex items-center justify-center
                  transition-all duration-300
                  ${isOpen ? "bg-primary border-primary" : "bg-background"}
                `}
              >
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  {/* Horizontal line */}
                  <motion.path
                    d="M5 12h14"
                    stroke={
                      isOpen
                        ? "white"
                        : isHovered
                          ? "rgb(36, 48, 210)"
                          : "rgb(115, 115, 115)"
                    }
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    transition={{ duration: 0.3 }}
                  />
                  {/* Vertical line */}
                  <motion.path
                    d="M12 5v14"
                    stroke={
                      isOpen
                        ? "white"
                        : isHovered
                          ? "rgb(36, 48, 210)"
                          : "rgb(115, 115, 115)"
                    }
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    animate={{ 
                      rotate: isOpen ? 90 : 0,
                      opacity: isOpen ? 0 : 1
                    }}
                    style={{ originX: "12px", originY: "12px" }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.svg>
              </motion.div>

              {isOpen && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-7 md:px-9 pb-7 md:pb-9">
                <div className="relative pl-6 border-l-2 border-primary/20">
                  <RichTextRenderer
                    content={item.answer}
                    className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5"
                  />

                  {Array.isArray(item.metadata) && item.metadata.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                      {item.metadata.map((meta: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-1 h-1 bg-primary rounded-full" />
                          <span className="text-muted-foreground">{meta.label}:</span>
                          <span className="font-medium text-card-foreground">{meta.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {Array.isArray(item.links) && item.links.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex flex-wrap items-center gap-4 pt-4 border-t border-primary/10"
                    >
                      {item.links.map((link: any, i: number) => (
                        <Link key={`${link.url}-${i}`} href={link.url}>
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group cursor-pointer"
                          >
                            <span>{link.label}</span>
                            <motion.svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="group-hover:translate-x-1 transition-transform"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" />
                            </motion.svg>
                          </motion.div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2"
          animate={
            isHovered
              ? { width: 14, height: 14, borderColor: "rgba(36, 48, 210, 0.5)" }
              : { width: 24, height: 24, borderColor: "rgba(36, 48, 210, 0.2)" }
          }
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2"
          animate={
            isHovered
              ? { width: 14, height: 14, borderColor: "rgba(36, 48, 210, 0.5)" }
              : { width: 24, height: 24, borderColor: "rgba(36, 48, 210, 0.2)" }
          }
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

// ── Category Filter ────────────────────────────────────────────────────────────

const CategoryFilter = ({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: any[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}) => {
  const normalizedCategories = [
    { id: "all", label: "All Questions", icon: "Layers" },
    ...(Array.isArray(categories) ? categories : [])
      .filter((cat) =>
        typeof cat === "string" ? cat !== "all" : cat?.id !== "all"
      )
      .map((cat) =>
        typeof cat === "string" ? { id: cat, label: cat, icon: null } : cat
      ),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {normalizedCategories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
          onClick={() => onCategoryChange(category.id)}
          className={`
            relative px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200
            ${activeCategory === category.id
              ? "text-white"
              : "text-muted-foreground hover:text-card-foreground bg-card/50 hover:bg-primary/5"
            }
          `}
        >
          {activeCategory === category.id && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 40, duration: 0.2 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {category.icon && <Icon name={category.icon} className="w-4 h-4" />}
            {category.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

// ── Search Bar ─────────────────────────────────────────────────────────────────

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`
        relative w-full max-w-md transition-all duration-200
        ${isFocused ? "scale-[1.02]" : "scale-100"}
      `}
    >
      <div
        className={`
          relative flex items-center bg-card rounded-full border transition-all duration-200
          ${isFocused
            ? "border-primary shadow-lg shadow-primary/10"
            : "border-border hover:border-border/80 shadow-md"
          }
        `}
      >
        <div className="absolute left-4 text-muted-foreground">
          <Icon name="Search" className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search questions..."
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-transparent rounded-full text-sm md:text-base text-card-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {isFocused && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute right-3 text-xs text-muted-foreground"
          >
            ⏎
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Export ────────────────────────────────────────────────────────────────

export default function PageInlineFaqs({
  faqs,
  faqSchemaMarkup,
  hideHeader = false,
  title,
  subtitle,
  badge,
  showFilters = false
}: {
  faqs?: any[];
  faqSchemaMarkup?: string;
  hideHeader?: boolean;
  title?: string;
  subtitle?: string;
  badge?: string;
  showFilters?: boolean;
}) {
  const { faq: globalFaq } = useContent();
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([0]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Use passed faqs prop, fall back to global faq items if none provided
  const items: any[] = faqs && faqs.length > 0 ? faqs : (globalFaq as any)?.items || [];

  // Extract unique categories from the items if they have category fields
  const rawCategories: any[] = (() => {
    const cats = items
      .map((item: any) => item.category)
      .filter(Boolean);
    const seen = new Set<string>();
    return cats.filter((cat: any) => {
      const id = typeof cat === "string" ? cat : cat?.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  })();

  // Pull badge / headline from the global FAQ section config
  const section = (globalFaq as any)?.section || {
    badge: "Got Questions?",
    headline: "Frequently Asked Questions",
    description: "",
  };

  const filteredItems = items.filter((item: any) => {
    if (!showFilters) return true;
    const itemCat =
      typeof item.category === "string" ? item.category : item.category?.id;
    const matchesCategory =
      activeCategory === "all" || itemCat === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      (item.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.answer || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setOpenItems([]);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".inline-faq-reveal",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  let bulkSchemaObj = null;
  if (typeof faqSchemaMarkup === "string" && faqSchemaMarkup.trim()) {
    try {
      let cleaned = faqSchemaMarkup.trim();
      if (cleaned.startsWith("<script")) {
        const closeBracket = cleaned.indexOf(">");
        if (closeBracket !== -1) cleaned = cleaned.substring(closeBracket + 1);
      }
      if (cleaned.endsWith("</script>")) {
        cleaned = cleaned.substring(0, cleaned.length - 9);
      }
      bulkSchemaObj = JSON.parse(cleaned.trim());
    } catch (e) {
      console.error("Failed to parse bulk FAQ schema:", e);
    }
  }

  const validFaqs = items.filter((item: any) => item && item.question && item.answer);

  if (validFaqs.length === 0 && !bulkSchemaObj) return null;

  // Collect valid custom schema markups from each FAQ item (legacy fallback)
  const customSchemas = validFaqs
    .filter((item: any) => item.schemaMarkup && item.schemaMarkup.trim())
    .map((item: any) => {
      try {
        return JSON.parse(item.schemaMarkup.trim());
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <>
      {bulkSchemaObj && (
        <Script
          id="bulk-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bulkSchemaObj) }}
        />
      )}
      {customSchemas.map((schema: any, idx: number) => (
        <Script
          id={`custom-faq-schema-${idx}`}
          key={`custom-faq-schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {validFaqs.length > 0 && isClient && (
        <section
          ref={sectionRef}
          className="relative bg-background py-4 md:py-8 lg:py-12 overflow-hidden"
        >
          <SubtleBackground />
          <FloatingParticles />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            {/* Section Header */}
            {!hideHeader && (
              <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 inline-faq-reveal">
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-3 block">
                  {badge || section?.badge || "Knowledge Base"}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4">
                  {title || section?.headline || "Frequently Asked Questions"}
                </h2>
                <div className="text-muted-foreground text-base md:text-lg">
                  {subtitle || section?.description ? (
                    typeof (subtitle || section?.description) === "string" ? (
                      <p>{subtitle || section?.description}</p>
                    ) : (
                      <RichTextRenderer content={subtitle || section?.description} />
                    )
                  ) : (
                    <p>Answers to common questions about our exterior remodeling services in St. Louis.</p>
                  )}
                </div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-6 rounded-full" />
              </div>
            )}

            {/* Filters + Search */}
            {showFilters && (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 md:mb-12 inline-faq-reveal">
                <CategoryFilter
                  categories={rawCategories}
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryChange}
                />
                <SearchBar onSearch={setSearchQuery} />
              </div>
            )}

            {/* FAQ Items */}
            <div className="space-y-3 md:space-y-4 mb-12 md:mb-16">
              {filteredItems.length > 0 ? (
                filteredItems.map((item: any, index: number) => (
                  <AccordionItem
                    key={item.id || `inline-faq-${index}`}
                    item={item}
                    index={index}
                    isOpen={openItems.includes(index)}
                    onToggle={handleToggle}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16"
                >
                  <div className="text-muted-foreground mb-3">
                    <Icon name="FileText" className="w-12 h-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-muted-foreground text-base">
                    No questions found matching your criteria.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory("all");
                      setSearchQuery("");
                    }}
                    className="mt-4 text-sm text-primary hover:text-primary/80 underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}