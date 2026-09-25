// Alias of /api/admin/blogs/... (the sidebar and every admin page use /blogs). One handler, no drift.
export { GET, PATCH, DELETE } from '../../../blogs/posts/[id]/route';
