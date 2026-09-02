---
name: audit-agent-blog-cms
description: Automated audit agent for the Blog publishing engine, post CRUD, categories, tags, WYSIWYG sanitization, and public blog routes.
---

# Agent 5: Blog & CMS Publication Engine Auditor

## Objective
Audit the end-to-end blog lifecycle: authoring, rich-text rendering, draft/publish workflows, taxonomy indexing (categories & tags), SEO slug generation, and public reading experience.

## Core Audit Targets
1. **Admin Blog Management**:
   - `src/app/admin/blog/page.tsx` & `src/components/admin/BlogPostEditor.tsx`
   - Post duplicate endpoint: `src/app/api/admin/blog/posts/duplicate/[id]/route.ts`
   - Bulk actions endpoint: `src/app/api/admin/blog/posts/bulk/route.ts`
2. **Taxonomy & Categorization**:
   - `src/models/Category.ts`, `src/models/Tag.ts`, `src/models/Post.ts`
   - APIs: `src/app/api/admin/blog/categories/route.ts`, `src/app/api/admin/blog/tags/route.ts`
3. **Public Blog Pages & Reading UI**:
   - `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`
   - `src/components/blog/ReadingProgress.tsx`, `src/components/blog/ShareButton.tsx`
   - `src/components/ui/RichTextRenderer.tsx` (DOMPurify HTML sanitization against XSS)
4. **Publication States & Edge Cases**:
   - Scheduled posts / future publishing timestamps.
   - Author profile association and missing featured image fallbacks.
