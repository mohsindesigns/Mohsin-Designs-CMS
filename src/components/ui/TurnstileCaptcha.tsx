"use client";

import React, { useEffect, useRef, useState } from "react";

// Official Cloudflare Turnstile Test Site Key (Always Passes)
const DEFAULT_TEST_SITE_KEY = "1x00000000000000000000AA";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: any) => void;
  siteKey?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error: any) => void;
          theme?: string;
          size?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export default function TurnstileCaptcha({
  onVerify,
  onExpire,
  onError,
  siteKey,
  theme = "auto",
  size = "flexible",
  className = "",
}: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  const activeSiteKey = siteKey || process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

  // 1. Ensure Cloudflare Turnstile script is loaded
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.turnstile) {
      setIsScriptReady(true);
      return;
    }

    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsScriptReady(true);
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", () => setIsScriptReady(true));
    }
  }, []);

  // 2. Render Turnstile Widget once container & script are ready
  useEffect(() => {
    if (!isScriptReady || !containerRef.current || !window.turnstile) return;

    // Clean up previous widget instance if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) {}
      widgetIdRef.current = null;
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: activeSiteKey,
        theme: theme,
        size: size,
        callback: (token: string) => {
          onVerify(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": (err: any) => {
          onError?.(err);
        },
      });
      widgetIdRef.current = widgetId;
    } catch (err) {
      console.error("Turnstile render error:", err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }
    };
  }, [isScriptReady, activeSiteKey, theme, size]);

  return (
    <div className={`turnstile-container my-2 flex justify-start ${className}`}>
      <div ref={containerRef} className="min-h-[65px] min-w-[280px]" />
    </div>
  );
}
