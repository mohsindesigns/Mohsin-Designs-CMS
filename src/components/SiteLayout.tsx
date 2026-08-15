"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import { usePathname } from "next/navigation";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // If we are on an admin route, we completely bypass the standard SiteLayout wrapper (Navbar, Footer)
  if (isAdmin) {
    return <div className="relative min-h-screen bg-[#080808]">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="relative min-h-screen">
        {/* 
          Keep the layout structure static and only animate children.
          This prevents the Navbar/Footer from flashing during transitions.
        */}
        <div className="relative z-10 flex flex-col min-h-screen opacity-100">
          <div className="z-50">
            <Navbar />
          </div>
          
          <main className="flex-grow">
            <PageTransition>{children}</PageTransition>
          </main>
          
          <div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}