"use client";

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface GridCard {
  icon?: string;
  title?: string;
  description?: string;
  colorTheme?: string;
}

interface FeaturedDetailGridProps {
  data?: {
    cards?: GridCard[];
  };
}

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  const Fallback = LucideIcons.Zap;
  if (!IconComponent) return <Fallback className={className} />;
  return <IconComponent className={className} />;
};

const themeGradientMap: Record<string, string> = {
  amber: "from-amber-500/20 to-orange-500/10",
  blue: "from-blue-500/20 to-purple-500/10",
  green: "from-green-500/20 to-emerald-500/10"
};

export default function FeaturedDetailGrid({ data }: FeaturedDetailGridProps) {
  if (!data || !data.cards || data.cards.length === 0) return null;

  const cards = data.cards;

  return (
    <section className="relative py-8 xs:py-10 sm:py-12 md:py-16 bg-background border-b border-border overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map((item, idx) => {
            const gradientClass = themeGradientMap[item.colorTheme || ""] || "from-amber-500/20 to-orange-500/10";
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${gradientClass} border border-primary/10 backdrop-blur-sm overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <DynamicIcon name={item.icon || "Zap"} className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3">{item.title || "Feature Card"}</h4>
                  <p className="text-muted-foreground leading-relaxed">{item.description || "Description goes here."}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
