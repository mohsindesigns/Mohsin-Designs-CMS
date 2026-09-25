// Alias of /api/blogs (kept so old callers keep working). One handler, no drift.
export { GET } from '../blogs/route';

// Route-segment config must be a literal in this file (it cannot be re-exported).
export const revalidate = 60;
