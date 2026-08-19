'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setProgress((window.scrollY / scrollHeight) * 100);
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[100] pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-brand-blue via-blue-600 to-brand-blue dark:from-brand-yellow dark:via-amber-400 dark:to-brand-yellow transition-all duration-150 ease-out shadow-[0_0_12px_rgba(3,6,172,0.6)] dark:shadow-[0_0_12px_rgba(233,189,54,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
