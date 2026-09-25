'use client';

import CtaButton from "@/components/ui/CtaButton";
import { Share2, Check, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ShareState = 'idle' | 'copied' | 'failed';

export default function ShareButton({ title }: { title: string }) {
  const [state, setState] = useState<ShareState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flash = (next: ShareState) => {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2500);
  };

  // Last-resort copy for browsers/contexts without the async clipboard API (plain http, older Safari).
  const legacyCopy = (text: string) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: currentUrl });
        return;
      } catch (err) {
        // The visitor closing the share sheet is not a failure: do nothing (used to silently
        // copy the link and claim "Link Copied"). Any other error falls through to copy.
        if ((err as any)?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      flash('copied');
    } catch {
      flash(legacyCopy(currentUrl) ? 'copied' : 'failed');
    }
  };

  return (
    <>
      <CtaButton
        fullWidth
        onClick={handleShare}
        icon={state === 'copied' ? <Check /> : state === 'failed' ? <AlertCircle /> : <Share2 />}
      >
        {state === 'copied' ? 'Link Copied to Clipboard!' : state === 'failed' ? 'Copy failed - copy the URL from the address bar' : 'Share This Article'}
      </CtaButton>
      {/* Screen-reader confirmation of the copy result */}
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Link copied to clipboard' : state === 'failed' ? 'Could not copy the link' : ''}
      </span>
    </>
  );
}
