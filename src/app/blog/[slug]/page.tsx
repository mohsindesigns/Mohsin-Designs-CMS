// /blog/:slug is permanently redirected to /blogs/:slug/ by next.config.ts, so this file is never served.
// It re-exports the canonical article page so the two route trees can never drift apart again.
export { default, generateMetadata } from '../../blogs/[slug]/page';

// Route-segment config must be a literal in this file (it cannot be re-exported).
export const revalidate = 60;
