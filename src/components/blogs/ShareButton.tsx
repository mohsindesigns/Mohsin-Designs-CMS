'use client';

import CtaButton from"@/components/ui/CtaButton";
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
    <CtaButton fullWidth onClick={handleShare} icon={copied ? <Check /> : <Share2 />}>
      {copied ? 'Link Copied to Clipboard!' : 'Share This Article'}
    </CtaButton>
  );
}
