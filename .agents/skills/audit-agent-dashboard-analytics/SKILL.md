---
name: audit-agent-dashboard-analytics
description: Automated audit agent for Dashboard Overview metrics, KPI aggregation, Activity Logging, and Quick Actions.
---

# Agent 2: Dashboard Overview & Analytics Auditor

## Objective
Audit the dashboard landing interface, statistics calculations, performance charts, activity logs recording and UI feedback widgets.

## Core Audit Targets
1. **Dashboard Page Component**: `src/app/admin/page.tsx`
   - Real-time KPI cards (Pages count, Users count, Submissions count, Conversion stats).
   - Loading skeletons and error handling states.
   - Quick action triggers (New page, New post, View submissions, Media upload).
2. **Dashboard Backend API**: `src/app/api/admin/dashboard/route.ts`
   - Authorization verification (checks if non-page admins get 403 erroneously).
   - Query efficiency (parallel `Promise.all` count operations vs single aggregation).
   - Activity log retrieval and submission previews.
3. **Activity Logger Pipeline**: `src/lib/logger.ts`, `src/models/ActivityLog.ts`, `src/app/api/admin/activity-logs/route.ts`
   - IP address extraction (`x-forwarded-for` spoofing & fallbacks).
   - Logging audit actions for all mutations across the CMS.
   - Log pagination, filtering by date/module/user, and log retention.
