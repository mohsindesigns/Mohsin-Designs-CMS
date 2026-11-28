// Client-safe (no server imports): used by both the blog API routes and BlogPostEditor.
// True when the HTML has visible text or an image; tags, &nbsp; and zero-width characters alone do not count.
export function hasBodyContent(html: unknown): boolean {
  const s = String(html ?? '');
  if (/<img\b/i.test(s)) return true;
  return !!s
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#0*160;|&#x0*a0;/gi, ' ')
    .replace(/[​-‍﻿]/g, '')
    .trim();
}
