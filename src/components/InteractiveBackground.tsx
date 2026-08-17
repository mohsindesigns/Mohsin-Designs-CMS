"use client";

import { useEffect, useState } from "react";

export default function InteractiveBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsHovered(true);
    };
    const handleMouseLeave = () => setIsHovered(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white dark:bg-[#080710] transition-colors duration-300">
      {/* Dynamic Animated Floating blobs */}
      <div className="absolute top-[10%] left-[5%] h-[550px] w-[550px] rounded-full bg-brand-blue/[0.015] blur-3xl animate-blob-float-global" />
      <div className="absolute bottom-[20%] right-[10%] h-[600px] w-[600px] rounded-full bg-brand-yellow/[0.025] blur-3xl animate-blob-float-global-delayed" />
      <div className="absolute top-[50%] left-[40%] h-[500px] w-[500px] rounded-full bg-brand-blue/[0.01] blur-3xl animate-blob-float-global" style={{ animationDelay: "8s" }} />

      {/* Interactive mouse-following cursor blob */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-700 ease-out"
        style={{
          background: "var(--background-mouse-glow)",
          left: `${mousePos.x - 250}px`,
          top: `${mousePos.y - 250}px`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Base Dotted Grid Pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(var(--background-grid-dot-color) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glowing Dotted Pattern Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          backgroundImage: "radial-gradient(var(--background-spotlight-color) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
          maskImage: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        }}
      />

      {/* Faint Base Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "linear-gradient(to right, var(--background-grid-line-color) 1px, transparent 1px), linear-gradient(to bottom, var(--background-grid-line-color) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Interactive Glowing Grid Lines */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          backgroundImage: "linear-gradient(to right, var(--background-grid-hover-line-color) 1px, transparent 1px), linear-gradient(to bottom, var(--background-grid-hover-line-color) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blob-float-global {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -70px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.92); }
        }
        .animate-blob-float-global {
          animation: blob-float-global 20s infinite ease-in-out;
        }
        .animate-blob-float-global-delayed {
          animation: blob-float-global 25s infinite ease-in-out;
          animation-delay: 5s;
        }
      `}} />
    </div>
  );
}
