import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';
import Content from '@/models/Content';
import Page from '@/models/Page';
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { verifyTurnstileToken } from '@/lib/turnstile';
import { buildLeadEmail, cleanExtra, cleanSubject, cleanText, isValidEmail } from '@/lib/leadMail';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// /api/send - the ONE lead endpoint shared by every site form.
//
// Callers (keep them all working): ContactForm, ContactTemplate, QAForm, QuickQuote,
// ServiceDetailTemplate, IndustryTemplate (JSON) and CareersTemplate (multipart + resume),
// plus the Footer newsletter box (JSON, no captcha).
//
// Contract:
//   accepts   name | fullName, email (required), phone, message, subject | _subject, type,
//             captchaToken | turnstileToken | _captcha | cf-turnstile-response,
//             any other scalar field (service, company, zipCode, role, industry, source ...)
//             -> stored in Submission.extraData and printed in the notification email.
//             `source` (page path) is promoted to Submission.source.
//   responds  200 { success:true, submissionId, emailSent }   lead stored and/or e-mailed
//             400 { error }   validation / captcha      429 { error }   rate limited
//             500 { error }   nothing could be stored AND e-mail failed (caller may fall back to mailto:)
// ─────────────────────────────────────────────────────────────────────────────

// Best-effort in-memory rate limit per client IP (per server instance). Not a substitute for
// Turnstile, but stops a single client from flooding the inbox / DB.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 10;
const rateHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  if (!ip || ip === 'unknown') return false; // no trustworthy IP -> don't lock everyone into one bucket
  const now = Date.now();
  const recent = (rateHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateHits.set(ip, recent);
  if (rateHits.size > 5000) {
    for (const [key, times] of rateHits) {
      if (!times.some((t) => now - t < RATE_WINDOW_MS)) rateHits.delete(key);
    }
  }
  return false;
}

// Keys that are control fields, never lead data.
const RESERVED_KEYS = new Set([
  'name', 'fullName', 'email', 'phone', 'message', 'subject', '_subject', 'type', 'attachment', '_template',
  'captchaToken', 'turnstileToken', '_captcha', 'cf-turnstile-response',
  '_hp', '_gotcha', // honeypot fields (bots fill them, humans never see them)
]);

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.csv'];

/** Page-level receiver (Contact page editor) -> site-wide Settings receiver -> env -> default. */
async function resolveReceiverEmail(type: string): Promise<string> {
  const extract = (value: unknown): string => {
    if (typeof value !== 'string') return '';
    const match = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0].toLowerCase() : '';
  };

  let receiver = '';
  try {
    // 1. The Contact page's own "Notification Receiver Email" (Contact editor > Notifications). It
    //    applies to contact enquiries only ('Contact Inquiry' / 'Contact Form'); quotes, careers,
    //    consultations and the newsletter use the site-wide address below. The live contact page is
    //    served at /contact-us (see next.config redirects), so find it by TEMPLATE, not a guessed slug.
    if (/^contact/i.test(type)) {
      const contactPages = (await Page.find({
        $or: [{ template: 'contact' }, { slug: { $in: ['contact', '/contact', 'contact-us'] } }],
        isTrashed: { $ne: true },
      })
        .select('status content.contactPage.receiverEmail content.receiverEmail')
        .lean()) as any[];
      contactPages.sort((a, b) => (a.status === 'published' ? 0 : 1) - (b.status === 'published' ? 0 : 1));
      for (const doc of contactPages) {
        receiver = extract(doc?.content?.contactPage?.receiverEmail) || extract(doc?.content?.receiverEmail);
        if (receiver) break;
      }
    }

    // 2. Site-wide settings (Admin > Settings > Contact) and legacy locations
    if (!receiver) {
      const contentDoc = (await Content.findOne({ key: 'complete_data' }).lean()) as any;
      const d = contentDoc?.data;
      if (d) {
        receiver =
          extract(d.contact?.receiverEmail) ||
          extract(d.contact?.email) ||
          extract(d.settings?.notificationEmail) ||
          (type === 'Quote Request' ? extract(d.quote?.email) : '') ||
          extract(d.contactPage?.receiverEmail) ||
          extract(d.contactPage?.email) ||
          extract(d.contactPage?.office?.email) ||
          extract(d.quote?.email) ||
          extract(d.footer?.contact?.email);
      }
    }
  } catch (e) {
    console.error('Error fetching dynamic receiver email', e);
  }

  return receiver || extract(process.env.ADMIN_NOTIFICATION_EMAIL) || 'hello@mohsindesigns.com';
}

export async function POST(request: Request) {
  try {
    const clientIp = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown').split(',')[0].trim() || 'unknown';

    if (isRateLimited(clientIp)) {
      return NextResponse.json({ error: 'Too many submissions from your connection. Please wait a few minutes and try again.' }, { status: 429 });
    }

    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_FILE_SIZE + 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'The submission is too large.' }, { status: 413 });
    }

    await connectDB();
    const contentType = request.headers.get('content-type') || '';

    let rawName = '', rawEmail = '', rawPhone = '', rawMessage = '', rawSubject = '', rawType = '';
    let captchaToken = '';
    let honeypot = '';
    let extraRaw: Record<string, unknown> = {};
    let pendingFile: { name: string; ext: string; buffer: Buffer } | null = null;
    let defaultType = 'Contact Form';

    if (contentType.includes('multipart/form-data')) {
      defaultType = 'Job Application'; // multipart is only used by the careers form (resume upload)
      const formData = await request.formData();
      rawName = str(formData.get('name'));
      rawEmail = str(formData.get('email'));
      rawPhone = str(formData.get('phone'));
      rawMessage = str(formData.get('message'));
      rawSubject = str(formData.get('subject')) || str(formData.get('_subject'));
      rawType = str(formData.get('type'));
      captchaToken = str(formData.get('captchaToken')) || str(formData.get('turnstileToken')) || str(formData.get('_captcha')) || str(formData.get('cf-turnstile-response'));
      honeypot = str(formData.get('_hp')) || str(formData.get('_gotcha'));

      // Optional file attachment (validated now, written to disk only after the lead is accepted)
      const file = formData.get('attachment');
      if (file && typeof file !== 'string' && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: 'Attached file exceeds the 10MB limit.' }, { status: 400 });
        }
        const dotIdx = file.name.lastIndexOf('.');
        const ext = dotIdx !== -1 ? file.name.substring(dotIdx).toLowerCase() : '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return NextResponse.json({
            error: 'Invalid file extension. Only PDF, Word (.doc, .docx), images (.png, .jpg, .webp), and text/CSV documents are allowed.'
          }, { status: 400 });
        }
        pendingFile = { name: file.name, ext, buffer: Buffer.from(await file.arrayBuffer()) };
      }

      // Collect other (text) fields; files other than `attachment` are ignored
      formData.forEach((value, key) => {
        if (typeof value === 'string' && !RESERVED_KEYS.has(key)) extraRaw[key] = value;
      });
    } else {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
      }
      rawName = str(body.name) || str(body.fullName);
      rawEmail = str(body.email);
      rawPhone = str(body.phone);
      rawMessage = str(body.message);
      rawSubject = str(body.subject) || str(body._subject);
      rawType = str(body.type);
      captchaToken = str(body.captchaToken) || str(body.turnstileToken) || str(body._captcha) || str(body['cf-turnstile-response']);
      honeypot = str(body._hp) || str(body._gotcha);
      for (const [key, value] of Object.entries(body)) {
        if (!RESERVED_KEYS.has(key)) extraRaw[key] = value;
      }
    }

    // Honeypot tripped -> pretend success so bots learn nothing; nothing is stored or mailed.
    if (honeypot.trim()) {
      return NextResponse.json({ success: true, message: 'Submission received' });
    }

    // ── Clean inputs (output is escaped everywhere it is rendered) ──
    const type = cleanText(rawType, 80) || defaultType;
    const name = cleanText(rawName, 200);
    const email = cleanText(rawEmail, 254);
    const phone = cleanText(rawPhone, 60);
    const message = cleanText(rawMessage, 10000);
    const subject = cleanSubject(rawSubject, '');

    // ── 1. Cloudflare Turnstile ──
    // A supplied token is always verified. When a real secret key is configured a missing token is
    // rejected too (otherwise a bot could just omit it); the Footer newsletter box cannot render the
    // widget, so 'Newsletter' stays exempt (it is rate limited instead).
    const turnstileConfigured = !!process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (captchaToken) {
      const captchaResult = await verifyTurnstileToken(captchaToken, clientIp);
      if (!captchaResult.success) {
        return NextResponse.json({ error: captchaResult.error || 'Security challenge verification failed. Please try again.' }, { status: 400 });
      }
    } else if (turnstileConfigured && type !== 'Newsletter') {
      return NextResponse.json({ error: 'Please complete the security check and try again.' }, { status: 400 });
    }

    // ── 2. Validate ──
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const extraData = (cleanExtra(extraRaw) || {}) as Record<string, unknown>;
    // `source` (page the form was sent from) belongs on the Submission itself, not in "extra".
    let source: string | undefined;
    if (typeof extraData.source === 'string' && extraData.source) source = extraData.source.slice(0, 200);
    delete extraData.source;

    // ── 3. Persist the attachment (public/uploads; silently skipped on read-only hosts) ──
    let attachmentUrl: string | undefined;
    const attachments: { filename: string; content: string }[] = [];
    if (pendingFile) {
      const dotIdx = pendingFile.name.lastIndexOf('.');
      const rawBase = dotIdx !== -1 ? pendingFile.name.substring(0, dotIdx) : pendingFile.name;
      const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
      const filename = `${Date.now()}_${cleanBase}${pendingFile.ext}`;
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        await writeFile(path.join(uploadDir, filename), pendingFile.buffer);
        attachmentUrl = `/uploads/${filename}`;
      } catch (fsErr: any) {
        console.warn('Filesystem write not available or failed:', fsErr.message);
      }
      attachments.push({
        filename: pendingFile.name.replace(/[\\/\r\n]/g, '_').slice(0, 120),
        content: pendingFile.buffer.toString('base64'),
      });
    }

    // ── 4. Save to database ──
    let submission: any = null;
    try {
      submission = await Submission.create({
        name: name || 'Anonymous',
        email,
        phone,
        subject: subject || undefined,
        message,
        type,
        source: source || undefined, // model default ("Website") applies when absent
        attachmentUrl,
        extraData,
      });
    } catch (dbError: any) {
      console.error('DATABASE SAVE ERROR:', dbError);
    }

    // ── 5. Notification e-mail ──
    const receiverEmail = await resolveReceiverEmail(type);
    const origin = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin).replace(/\/+$/, '');
    const { html, text } = buildLeadEmail({
      type,
      name: name || 'Anonymous',
      email,
      phone,
      subject,
      message,
      source,
      extraData,
      attachmentUrl: attachmentUrl ? `${origin}${attachmentUrl}` : undefined,
      attachmentNames: attachmentUrl ? undefined : attachments.map((a) => a.filename),
    });

    let emailSent = false;
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set - lead was stored but no notification e-mail was sent.');
    } else {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error: resendError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Mohsin Designs <onboarding@resend.dev>',
          to: [receiverEmail],
          replyTo: email,
          subject: cleanSubject(subject, `New ${type}: ${name || email}`),
          html,
          text,
          attachments,
        });
        if (resendError) {
          console.error('RESEND API ERROR:', {
            name: resendError.name,
            message: resendError.message,
            receiver: receiverEmail,
            isDefaultSender: !process.env.RESEND_FROM_EMAIL && !process.env.RESEND_DOMAIN_VERIFIED,
          });
        } else {
          emailSent = true;
        }
      } catch (mailErr: any) {
        console.error('RESEND SEND FAILED:', mailErr?.message);
      }
    }

    // Lost lead: nothing stored AND nothing mailed -> tell the caller so it can fall back (e.g. mailto:).
    if (!submission && !emailSent) {
      return NextResponse.json({ error: 'We could not process your request right now. Please try again or email us directly.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Submission saved and email sent' : 'Submission saved',
      emailSent,
      submissionId: submission?._id,
    });

  } catch (error: any) {
    console.error('CRITICAL API ERROR IN /api/send:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json({
      error: 'Critical server error',
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
    }, { status: 500 });
  }
}
