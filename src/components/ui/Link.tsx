"use client";

import NextLink from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { withTrailingSlash } from "@/lib/url";

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for next/link. The site uses `trailingSlash: true`, so this
 * renders every internal href with its trailing slash ("/about-us/") - what shows on
 * hover, what gets crawled, and what the browser lands on (no 308 hop).
 * Always import Link from here instead of"next/link".
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, ...props }, ref) {
  const fixed =
    typeof href ==="string"
      ? withTrailingSlash(href)
      : { ...href, pathname: withTrailingSlash(href.pathname) };
  return <NextLink ref={ref} href={fixed} {...props} />;
});

export default Link;
