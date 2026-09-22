"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Scale, Gem, Zap, Target, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { useContent } from "../hooks/useContent";
import RichTextRenderer from "./ui/RichTextRenderer";

const iconMap: Record<string, any> = {
  BadgeCheck,
  Scale,
  Gem,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  ShieldCheck
};

export default function TeamValues() {
  const { aboutPage } = useContent();
  const valuesData = aboutPage?.values || { items: [] };

  if (!valuesData.items || valuesData.items.length === 0) return null;

  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-7xl font-bold tracking-tight mb-6">
            {valuesData.headline?.replace(valuesData.highlight || '', '')} <br />
            <span className="bg-gradient-to-r from-primary to-primary/95 bg-clip-text text-transparent">{valuesData.highlight}</span>
          </h2>
          <RichTextRenderer
            content={valuesData.description}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(valuesData.items || []).map((value: any, idx: number) => {
            const VIcon = iconMap[value.icon] || BadgeCheck;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-8 rounded-3xl border border-border hover:border-primary/50 transition-all shadow-lg hover:shadow-2xl group"
              >
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <VIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <RichTextRenderer
                  content={value.description}
                  className="text-muted-foreground mb-6"
                />
                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{value.statLabel}</span>
                  <span className="text-2xl font-bold text-primary">{value.stat}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}