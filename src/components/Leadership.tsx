"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useContent } from "../hooks/useContent";
import { Icon } from "../config/icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RichTextRenderer from "./ui/RichTextRenderer";

gsap.registerPlugin(ScrollTrigger);

export default function Leadership() {
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const { leadership } = useContent();
  const story = leadership || { section: {}, ceo: {} };
  const ceo = story.ceo || {};

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.leadership-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
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

  // Handle missing data case
  if (!ceo.name && !story.section?.headline) return null;

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="relative bg-background py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px sm:80px 80px',
          }}
        />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-b from-primary/5 to-transparent opacity-60 blur-3xl" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-30">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-20 leadership-reveal">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-r from-primary/30 to-primary" />
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-primary">
              {story.section?.badge || "Our Leadership"}
            </span>
            <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-r from-primary to-primary/30" />
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-foreground mb-4 sm:mb-6 leading-tight px-2"
          >
            {(story.section?.headlinePrefix || story.section?.headlineHighlight || story.section?.headlineSuffix) ? (
              <>
                {story.section?.headlinePrefix && (
                  <span>{story.section.headlinePrefix} </span>
                )}
                {story.section?.headlineHighlight && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-semibold">
                    {story.section.headlineHighlight}
                  </span>
                )}
                {story.section?.headlineSuffix && (
                  <span> {story.section.headlineSuffix}</span>
                )}
              </>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: story.section?.headline || "" }} />
            )}
          </h2>

          <RichTextRenderer
            content={story.section?.description}
            className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl font-light max-w-2xl mx-auto px-3 sm:px-4 text-center"
            stripParagraphs={true}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-start">
          <div className="leadership-reveal lg:sticky lg:top-24">
            <div className="relative group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/20 to-primary/20 rounded-2xl sm:rounded-3xl blur-lg group-hover:blur-xl transition-all duration-700" />
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/50 h-[350px] xs:h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px]">
                  {ceo.image?.src && (ceo.image.src.startsWith('http') || ceo.image.src.startsWith('/uploads') || ceo.image.src.startsWith('/cdn-images')) ? (
                    <img
                      src={ceo.image.src}
                      alt={ceo.alt || ceo.name || "CEO"}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={ceo.image?.src || "/eagle-logo.png"}
                      alt={ceo.alt || ceo.name || "CEO"}
                      className="object-cover"
                      fill
                      quality={100}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 50vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />
                </div>

                {ceo.badges?.top && (
                  <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10">
                    <div className="bg-card/95 backdrop-blur-sm px-2 sm:px-3 md:px-5 py-1 sm:py-2 md:py-2.5 rounded-full shadow-xl border border-border">
                      <span className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] md:text-xs font-bold text-primary">
                        <Icon name="Flag" className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                        {ceo.badges.top}
                      </span>
                    </div>
                  </div>
                )}

                {ceo.badges?.bottom && (
                  <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 right-3 sm:right-4 md:right-6 z-10">
                    <div className="bg-card/95 backdrop-blur-sm px-2 sm:px-3 md:px-5 py-1 sm:py-2 md:py-2.5 rounded-full shadow-xl border border-border">
                      <span className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] md:text-xs font-bold text-primary">
                        <Icon name="Award" className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                        {ceo.badges.bottom}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 md:space-y-10 leadership-reveal">
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-3 sm:mb-4 text-left">
                {ceo.name}
                <span className="block text-xs sm:text-sm font-mono text-primary mt-1 sm:mt-2 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                  {ceo.title}
                </span>
              </h3>

              {ceo.quotes && ceo.quotes.length > 0 && (
                <div className="mt-6 sm:mt-8 relative">
                  <div className="absolute -left-2 sm:-left-4 -top-2 text-primary/20">
                    <Icon name="Quote" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </div>
                  <RichTextRenderer
                    content={ceo.quotes[0]}
                    className="text-foreground text-base sm:text-lg md:text-xl font-medium leading-relaxed pl-4 sm:pl-6 md:pl-8"
                  />
                </div>
              )}

              <RichTextRenderer
                content={ceo.description}
                className="mt-6 sm:mt-8 space-y-4 text-muted-foreground"
              />

              <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 mt-8 sm:mt-10 pt-4 border-t border-border">
                {(ceo.socials || []).map((social: any, idx: number) => (
                  <motion.a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 sm:p-3 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                    aria-label={social.icon}
                  >
                    <Icon name={social.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
