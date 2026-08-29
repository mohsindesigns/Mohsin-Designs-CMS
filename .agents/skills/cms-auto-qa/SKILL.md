---
name: cms-auto-qa
description: "Crawls all CMS templates, admin dashboard pages, forms, and APIs, identifies bugs, and fixes them automatically."
---

# CMS Autonomous QA & Bug-Fixing Playbook

## 1. Discovery Phase
- Inspect `src/app/` to list all routes (Admin dashboard, Blog, Gallery, Services, Locations, dynamic `[...slug]` templates).
- Start the development server (`npm run dev`) and ensure the database is connected.

## 2. Browser Subagent Execution
Launch a browser subagent to visit each route:
- **Admin Dashboard**: Test login, media manager, blog post CRUD, settings, and form submissions.
- **Templates**: Verify header/footer rendering, image loads, responsive layouts, and metadata.
- **Console & Network Inspection**: Capture 4xx/5xx HTTP responses, JavaScript unhandled exceptions, and React hydration errors.

## 3. Automatic Remediation
- For each detected bug, locate the responsible file in `src/`.
- Apply code corrections.
- Re-run the browser check to verify the fix before moving to the next page.
