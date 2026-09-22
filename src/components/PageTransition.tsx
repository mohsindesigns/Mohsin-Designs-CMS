"use client";

import React from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-screen w-full">{children}</div>;
}