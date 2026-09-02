'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: currentUrl,
        });
        return;
      } catch (err) {
        // user cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2.5 bg-brand-blue dark:bg-brand-yellow text-white dark:text-[#080710] px-6 py-3.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-brand-blue/20 dark:shadow-brand-yellow/15 cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-800 shrink-0" />
          <span>Link Copied to Clipboard!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Share This Article</span>
        </>
      )}
    </button>
  );
}
