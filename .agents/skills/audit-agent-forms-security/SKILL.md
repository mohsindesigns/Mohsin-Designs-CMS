---
name: audit-agent-forms-security
description: Automated audit agent for Lead Generation forms, Cloudflare Turnstile Captcha verification, input sanitization, and email dispatcher security.
---

# Agent 7: Form Submissions, Lead Gen & Captcha Security Auditor

## Objective
Audit the entire lead capture pipeline: form validations, Cloudflare Turnstile anti-bot verification, email injection prevention, database storage, and admin submission review.

## Core Audit Targets
1. **Frontend Capture Forms**:
   - `src/components/ContactForm.tsx`, `src/components/QuickQuote.tsx`, `src/components/QAForm.tsx`
   - Real-time client-side validation (Zod schema adherence, phone number formatting, email regex).
   - Turnstile Captcha integration: `src/components/ui/TurnstileCaptcha.tsx`, `src/lib/turnstile.ts`.
2. **Submission Ingestion & Notification API**:
   - `src/app/api/send/route.ts` & `src/models/Submission.ts`
   - Input sanitization: `src/lib/sanitizeInput.ts` (anti-XSS and anti-header injection).
   - Email dispatch providers (Nodemailer / Resend configurations and error handling).
3. **Admin Submission Dashboard**:
   - `src/app/admin/submissions/page.tsx`, `src/app/api/admin/submissions/route.ts`
   - Bulk export (CSV/Excel), read/unread status toggles, deletion authorization.
