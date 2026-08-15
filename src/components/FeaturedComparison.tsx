"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import decksImg from '@/assets/outdoor-sitting-desk.png';

interface CardData {
  title?: string;
  subtitle?: string;
  icon?: string;
  features?: string[];
  footerLabel?: string;
  footerValue?: string;
  isRecommended?: boolean;
}

interface FeaturedComparisonProps {
  data?: {
    badge?: string;
    titleLine1?: string;
    titleLine2?: string;
    description?: string;
    image?: string;
    imageBadge?: string;
    imageTitle?: string;
    imageDescription?: string;
    comparisonTitle?: string;
    comparisonSubtitle?: string;
    comparisonDescription?: string;
    card1?: CardData;
    card2?: CardData;
  };
}

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  // Fallback icon if not found
  const Fallback = LucideIcons.HelpCircle;
  if (!IconComponent) return <Fallback className={className} />;
  return <IconComponent className={className} />;
};

export default function FeaturedComparison({ data }: FeaturedComparisonProps) {
  if (!data) return null;

  const {
    badge = "Premium Material Showcase",
    titleLine1 = "Composite & PVC:",
    titleLine2 = "Built Different",
    description = "Two premium paths to your dream outdoor space. Discover why our deck installations are the gold standard.",
    image = "",
    imageBadge = "Award-Winning Craftsmanship",
    imageTitle = "Transform Your Outdoor Living",
    imageDescription = "Every deck we build is a masterpiece of engineering and design, backed by industry-leading warranties.",
    comparisonTitle = "Compare & Choose",
    comparisonSubtitle = "Find Your Perfect Material",
    comparisonDescription = "Side-by-side comparison of our premium decking solutions",
    card1 = {},
    card2 = {}
  } = data;

  // Preserve the exact highlight behavior dynamically
  const isFeatureHighlighted = (idx: number, isCard2: boolean) => {
    if (isCard2) return idx === 0 || idx === 1;
    return idx === 0;
  };

  return (
    <section className="relative py-8 xs:py-10 sm:py-12 md:py-16 bg-background border-b border-border overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px]"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-[120px]"
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 20, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl mx-auto mb-16 sm:mb-20"
        >
          {/* Premium Badge with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 text-primary px-5 py-2.5 rounded-full border border-primary/30 mb-8 backdrop-blur-sm"
          >
            <DynamicIcon name="Sparkles" className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">{badge}</span>
            <DynamicIcon name="Sparkles" className="w-4 h-4" />
          </motion.div>

          <h2 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6 leading-[1.1]">
            {titleLine1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary">
              {titleLine2}
            </span>
          </h2>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-primary/50" />
            <DynamicIcon name="Star" className="w-4 h-4 text-primary fill-primary" />
            <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Hero Feature Image - Full Width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 mb-16 group"
        >
          {image ? (
            <img
              src={image}
              alt={imageTitle || "Premium showcase"}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          ) : (
            <Image
              src={decksImg}
              alt="Premium deck showcase"
              fill
              quality={100}
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl"
            >
              {imageBadge && (
                <span className="inline-block bg-primary text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
                  {imageBadge}
                </span>
              )}
              {imageTitle && (
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  {imageTitle}
                </h3>
              )}
              {imageDescription && (
                <p className="text-white/80 text-lg mb-6">
                  {imageDescription}
                </p>
              )}
            </motion.div>
          </div>

          {/* Decorative Corner Accents */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-2xl" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/20 rounded-bl-2xl" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/20 rounded-br-2xl" />
        </motion.div>

        {/* Material Comparison - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            {comparisonTitle && (
              <span className="text-primary text-sm font-bold uppercase tracking-[0.3em]">{comparisonTitle}</span>
            )}
            {comparisonSubtitle && (
              <h3 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mt-3 mb-4">
                {comparisonSubtitle}
              </h3>
            )}
            {comparisonDescription && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {comparisonDescription}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 bg-card border-border hover:border-primary/30`}
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <DynamicIcon name={card1.icon || "TreePine"} className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-foreground">{card1.title || "Capped Composite"}</h4>
                    <p className="text-sm text-muted-foreground">{card1.subtitle || "Wood fiber blend"}</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {(card1.features || []).map((feature, idx) => {
                    const highlighted = isFeatureHighlighted(idx, false);
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${highlighted ? 'bg-primary/20' : 'bg-primary/10'}`}>
                          <DynamicIcon name="CheckCircle" className={`w-3.5 h-3.5 ${highlighted ? 'text-primary' : 'text-primary/70'}`} />
                        </div>
                        <span className={`${highlighted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {(card1.footerLabel || card1.footerValue) && (
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{card1.footerLabel}</span>
                      <span className="text-2xl font-bold text-foreground">{card1.footerValue}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 bg-card ${
                card2.isRecommended
                  ? 'border-primary shadow-2xl shadow-primary/20 bg-gradient-to-b from-primary/5 to-transparent'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {card2.isRecommended && (
                <div className="absolute top-0 right-0 z-20">
                  <div className="bg-primary text-white text-xs font-bold px-6 py-2 rounded-bl-2xl shadow-lg">
                    ⭐ RECOMMENDED
                  </div>
                </div>
              )}

              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <DynamicIcon name={card2.icon || "Droplets"} className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-foreground">{card2.title || "Cellular PVC"}</h4>
                    <p className="text-sm text-muted-foreground">{card2.subtitle || "100% polymer"}</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {(card2.features || []).map((feature, idx) => {
                    const highlighted = isFeatureHighlighted(idx, true);
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${highlighted ? 'bg-primary/20' : 'bg-primary/10'}`}>
                          <DynamicIcon name="CheckCircle" className={`w-3.5 h-3.5 ${highlighted ? 'text-primary' : 'text-primary/70'}`} />
                        </div>
                        <span className={`${highlighted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {(card2.footerLabel || card2.footerValue) && (
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{card2.footerLabel}</span>
                      <span className="text-2xl font-bold text-foreground">{card2.footerValue}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
