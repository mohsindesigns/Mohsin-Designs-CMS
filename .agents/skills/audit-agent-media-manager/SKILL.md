---
name: audit-agent-media-manager
description: Automated audit agent for Media library, file uploads, MIME type validation, thumbnail generation, disk/cloud storage, and asset replacement.
---

# Agent 6: Media Asset Manager & Storage Auditor

## Objective
Audit the media asset management subsystem, verifying file upload limits, security checks against malicious file types (SVG sanitization, executable blocking), storage engine consistency, and asset replacement without broken links.

## Core Audit Targets
1. **Media Admin Library Interface**:
   - `src/app/admin/media/page.tsx`
   - `src/components/admin/MediaSelector.tsx` (Search, filter by image/document/video, bulk select, delete modal)
2. **Upload & Storage Endpoints**:
   - `src/app/api/upload/route.ts` & `src/app/api/admin/media/route.ts`
   - `src/app/api/admin/media/[id]/route.ts` & `src/app/api/admin/media/replace/[id]/route.ts`
   - `src/lib/storage.ts` (Local filesystem `/public/uploads/` vs cloud storage abstraction)
3. **Security & Validation Checks**:
   - File size limits and MIME type enforcement.
   - SVG sanitization (prevention of stored SVG XSS attacks).
   - Filename sanitization (path traversal `../` prevention).
   - Orphaned physical files cleanup when MongoDB Media documents are deleted.
