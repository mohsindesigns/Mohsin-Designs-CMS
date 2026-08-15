"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="py-20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-6 text-2xl text-muted-foreground font-light">Oops! Page not found</p>
        <Link href="/" className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-medium">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

