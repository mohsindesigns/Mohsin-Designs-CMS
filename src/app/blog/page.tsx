// /blog is permanently redirected to /blogs/ by next.config.ts, so this file is never served.
// It re-exports the canonical index so that, if the redirect is ever removed, both URLs render the
// SAME page (same post filters, same SEO, canonical -> /blogs/). Do not fork this file again.
export { default, generateMetadata } from '../blogs/page';

// Route-segment config must be a literal in this file (it cannot be re-exported).
export const revalidate = 60;
