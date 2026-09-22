"use client";

import React, { createContext, useContext, useState } from "react";

interface LoadingContextType {
  hasLoaded: boolean;
  setHasLoaded: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // Back to simple React state so it resets on browser refresh
  const [hasLoaded, setHasLoaded] = useState(true);

  return (
    <LoadingContext.Provider value={{ hasLoaded, setHasLoaded }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useGlobalLoading must be used within a LoadingProvider");
  }
  return context;
}
