"use client";

import { useEffect } from "react";

export default function PremiumLoader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Immediately signal that loading is complete to remove the screen site-wide
    onComplete();
  }, [onComplete]);

  return null;
}