"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Star } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import RichTextRenderer from "../ui/RichTextRenderer";

// ---------- Image map: keys match galleryPage.projects[].image ----------
import deck2a from "../../assets/outdoor-sitting-desk.png";
import deck2b from "../../assets/pvcdecks.jpg.jpeg";
import pvcImg from "../../assets/pvcdecks.jpg.jpeg";
import deckMain from "../../assets/outdoor-sitting-desk.png";
import windowImg from "../../assets/window5.jpeg";
import window2Img from "../../assets/windowimage.jpg";
import doorImg from "../../assets/windowimage.jpg";          // reuse best available
import residental1Img from "../../assets/roof1.jpg.jpeg";
import residental2Img from "../../assets/residentalroofing2ndimage.jpg";
import commercialRoofImg from "../../assets/commercial-tpo.png";
import sidingImg from "../../assets/siding5.jpg.jpeg";
import gutterImg from "../../assets/gutterinstallation.jpg.jpeg";
import portfolioFallback from "../../assets/portfolio-hero.jpg";
import PageInlineFaqs from "@/components/PageInlineFaqs";

const IMAGE_MAP: Record<string, any> = {
  deck1: deckMain,
  deck2: deck2a,
  deck3: deck2b,
  pvc: pvcImg,
  windowImg: windowImg,
  window2: window2Img,
  door: doorImg,
  residental1: residental1Img,
  residental2: residental2Img,
  commercialroof: commercialRoofImg,
  siding: sidingImg,
  gutter: gutterImg,
  home1: residental1Img,
  home2: residental2Img,
  home3: deckMain,
  home4: windowImg,
  home5: sidingImg,
  home6: gutterImg,
};

function resolveImage(key: string, assetMap: any = {}) {
  if (!key) return portfolioFallback;
  // If it already looks like a real URL or path, use as-is
  if (typeof key === 'string' && (key.startsWith("http") || key.startsWith("/") || key.startsWith("blob:"))) return key;
  return (assetMap[key] || IMAGE_MAP[key]) ?? portfolioFallback;
}

// ---------- Lightbox ----------
const Lightbox = ({ project, assetMap, onClose }: { project: any; assetMap: any; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="relative max-w-4xl w-full bg-card rounded-2xl overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="relative h-[50vh]">
        {(() => {
          const img = resolveImage(project.image, assetMap);
          return (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/uploads') || img.startsWith('/cdn-images'))) ? (
            <img src={img} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <Image src={img} alt={project.title} fill className="object-cover" />
          );
        })()}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-foreground">{project.title}</h3>
            <p className="text-primary text-sm font-semibold">{project.category}</p>
          </div>
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
            {project.category}
          </span>
        </div>
        <RichTextRenderer
          content={project.desc}
          className="text-muted-foreground text-sm leading-relaxed mb-4"
        />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {project.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {project.location}</span>
          )}
          {project.year && (
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {project.year}</span>
          )}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ---------- Masonry Card ----------
const MasonryCard = ({ project, assetMap, onClick }: any) => {
  const img = resolveImage(project.image, assetMap);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -4 }}
      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-muted h-[280px] shadow-lg"
      onClick={onClick}
    >
      {(typeof img === 'string' && (img.startsWith('http') || img.startsWith('/uploads') || img.startsWith('/cdn-images'))) ? (
        <img
          src={img}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <Image
          src={img}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
        <div>
          <h3 className="text-white text-base font-bold leading-tight">{project.title}</h3>
          <p className="text-white/70 text-xs mt-1">{project.category}</p>
        </div>
      </div>
      {project.featured && (
        <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-white" /> Featured
        </div>
      )}
    </motion.div>
  );
};

// ---------- Template ----------
export default function GalleryTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { galleryPage: globalGalleryPage, portfolio: globalPortfolio, images } = useContent();
  const assetMap = images?.portfolio || {};
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxProject, setLightboxProject] = useState<any>(null);

  // Prefer page-specific content, fall back to global
  const pageContent = pageData?.content || {}
  const portfolio = pageContent?.portfolio || globalPortfolio;
  const galleryPage = pageContent?.galleryPage || globalGalleryPage;

  // Projects now come from the portfolio managed in the dashboard
  const projects: any[] = portfolio?.projects || [];

  // Dynamically generate categories from the projects
  const categories: string[] = useMemo(() => {
    const cats = ["All"];
    projects.forEach((p: any) => {
      if (p.category && !cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [projects]);

  const filteredProjects = useMemo(
    () => (activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory)),
    [activeCategory, projects]
  );

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 mb-6"
        >
          <Star className="w-4 h-4 fill-primary" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {galleryPage?.header?.badge || "Our Work"}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold mb-4 text-foreground"
        >
          {(galleryPage?.header?.titlePrefix || galleryPage?.header?.titleHighlight) ? (
            <>
              {galleryPage?.header?.titlePrefix && (
                <span>{galleryPage.header.titlePrefix} </span>
              )}
              {galleryPage?.header?.titleHighlight && (
                <span className="text-primary">{galleryPage.header.titleHighlight}</span>
              )}
              {galleryPage?.header?.titleSuffix && (
                <span> {galleryPage.header.titleSuffix}</span>
              )}
            </>
          ) : (
            galleryPage?.header?.title || "Project Gallery"
          )}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RichTextRenderer
            content={galleryPage?.header?.description || "Browse our completed projects across St. Louis."}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          />
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center flex-wrap gap-3 mb-10 px-4">
        {categories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${activeCategory === cat
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
              : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project: any, i: number) => (
            <MasonryCard
              key={project.id ?? i}
              project={project}
              assetMap={assetMap}
              onClick={() => setLightboxProject(project)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxProject && (
          <Lightbox project={lightboxProject} assetMap={assetMap} onClose={() => setLightboxProject(null)} />
        )}
      </AnimatePresence>

    </main>
  );
}