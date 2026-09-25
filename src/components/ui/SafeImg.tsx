"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

interface SafeImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  /** Called once when the image fails, so a parent can drop its frame/badge too. */
  onFail?: () => void;
}

/**
 * A plain <img> that removes itself when the file cannot be loaded, instead of showing the
 * browser's broken-image icon. Default artwork referenced by templates is not always shipped
 * in /public and admin-entered URLs rot, so every decorative/cover image goes through this.
 *
 * Why not a bare onError? Images usually finish (and fail) before React hydrates; the error
 * event is then lost, and mutating the element's style in the handler makes the server and
 * client markup disagree (hydration warning). Tracking the failure in state and re-checking
 * `complete && naturalWidth === 0` after mount covers both cases cleanly.
 */
export default function SafeImg({ src, onFail, alt = "", ...rest }: SafeImgProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const reported = useRef(false);

  const fail = () => {
    setFailed(true);
    if (!reported.current) {
      reported.current = true;
      onFail?.();
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0 && src) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!src || failed) return null;
  return <img ref={ref} src={src} alt={alt} onError={fail} {...rest} />;
}
