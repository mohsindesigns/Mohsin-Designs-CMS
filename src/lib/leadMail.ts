// Helpers for /api/send (the shared lead endpoint). Pure functions, no I/O, so they can be
// unit-tested without a DB or mail provider. Only src/app/api/send/route.ts imports this file.
//
// Why this exists: the route used to (a) interpolate raw user input into email HTML
// (only a lossy tag-stripper stood in the way of HTML/attribute injection) and (b) build a
// rich email that was never actually sent - so fields like service/company/zip/timeline/role
// were stored but never reached the inbox. Everything user-controlled is escaped here.

/** Escape a value for safe interpolation into HTML text or a double-quoted attribute. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Cleans one free-text form value for storage.
 * - removes <script>/<style> blocks and well-formed HTML tags (`<b>`, `</div>`, `<a href=..>`)
 * - deliberately does NOT eat a lone "<" ("budget < $5k", "I <3 this"): the old shared
 *   sanitizer treated "<3 ..." as an unterminated tag and deleted the rest of the message.
 *   That is safe because every sink (email, admin React UI, CSV) escapes on output.
 * - drops control characters, trims, and caps the length.
 */
export function cleanText(value: unknown, max = 5000): string {
  if (value === null || value === undefined) return "";
  let s = typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : "";
  s = s.replace(/<script\b[\s\S]*?<\/script\s*>/gi, "");
  s = s.replace(/<style\b[\s\S]*?<\/style\s*>/gi, "");
  s = s.replace(/<\/?[a-zA-Z][^<>]*>/g, "");
  s = s.replace(CONTROL_CHARS, "");
  return s.trim().slice(0, max);
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Cleans a Mongo-bound object: safe keys (no `$`/`.`), bounded depth / breadth / string length. */
export function cleanExtra(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return cleanText(value, 2000);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (depth >= 3) return undefined;
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => cleanExtra(v, depth + 1)).filter((v) => v !== undefined);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    let n = 0;
    for (const [rawKey, v] of Object.entries(value as Record<string, unknown>)) {
      if (n >= 40) break;
      const key = cleanText(rawKey, 60).replace(/[.$]/g, "_");
      if (!key || FORBIDDEN_KEYS.has(key)) continue;
      const cleaned = cleanExtra(v, depth + 1);
      if (cleaned === undefined) continue;
      out[key] = cleaned;
      n++;
    }
    return out;
  }
  return undefined;
}

/** "zipCode" / "project_type" / "sms_consent" -> "Zip Code" / "Project Type" / "Sms Consent". */
export function humanizeKey(key: string): string {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Loose but safe e-mail check (also blocks anything that could break out of a header/attribute). */
export function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@<>"'`,;()\[\]\\]+@[^\s@<>"'`,;()\[\]\\]+\.[^\s@<>"'`,;()\[\]\\]{2,}$/.test(email);
}

/** One-line, header-safe subject. */
export function cleanSubject(value: unknown, fallback: string): string {
  const s = cleanText(value, 200).replace(/[\r\n]+/g, " ").trim();
  return s || fallback;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
}

export interface LeadEmailInput {
  type: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  source?: string;
  extraData?: Record<string, unknown>;
  /** Absolute URL to the uploaded attachment, if it was saved to disk. */
  attachmentUrl?: string;
  /** Names of files attached to the mail itself. */
  attachmentNames?: string[];
  submittedAt?: Date;
}

/** Builds the notification e-mail (HTML + plain text). Every user value is escaped / plain. */
export function buildLeadEmail(input: LeadEmailInput): { html: string; text: string } {
  const { type, name, email, phone, subject, message, source, extraData, attachmentUrl, attachmentNames } = input;
  const when = (input.submittedAt || new Date()).toUTCString();

  const extraRows = Object.entries(extraData || {})
    .map(([k, v]) => [humanizeKey(k), displayValue(v)] as const)
    .filter(([, v]) => v !== "");

  const row = (label: string, valueHtml: string) =>
    `<tr><td style="padding:7px 12px 7px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>` +
    `<td style="padding:7px 0;color:#0f172a;font-size:14px;font-weight:500;word-break:break-word;">${valueHtml}</td></tr>`;

  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : "";
  const telHref = phone ? escapeHtml(phone.replace(/[^0-9+]/g, "")) : "";

  const rows = [
    row("Type", `<span style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-weight:600;">${escapeHtml(type)}</span>`),
    row("Name", escapeHtml(name)),
    row("Email", `<a href="mailto:${safeEmail}" style="color:#0306AC;">${safeEmail}</a>`),
    row("Phone", phone ? (telHref ? `<a href="tel:${telHref}" style="color:#0306AC;">${safePhone}</a>` : safePhone) : `<span style="color:#94a3b8;">Not provided</span>`),
    subject ? row("Subject", escapeHtml(subject)) : "",
    source ? row("Sent from", escapeHtml(source)) : "",
  ].join("");

  const extraHtml = extraRows.length
    ? `<p style="margin:24px 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Additional details</p>` +
      `<table role="presentation" style="width:100%;border-collapse:collapse;">${extraRows.map(([k, v]) => row(k, escapeHtml(v))).join("")}</table>`
    : "";

  const attachHtml = attachmentUrl
    ? `<p style="margin:20px 0 0;font-size:14px;"><strong>Attachment:</strong> <a href="${escapeHtml(attachmentUrl)}" style="color:#0306AC;">Download file</a></p>`
    : attachmentNames && attachmentNames.length
    ? `<p style="margin:20px 0 0;font-size:14px;"><strong>Attachment:</strong> ${attachmentNames.map(escapeHtml).join(", ")} (attached to this email)</p>`
    : "";

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:620px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#ffffff;">
  <div style="background:#2430d2;padding:18px 24px;border-bottom:3px solid #E9BD36;">
    <h1 style="color:#ffffff;margin:0;font-size:18px;">New ${escapeHtml(type)}</h1>
  </div>
  <div style="padding:24px;">
    <table role="presentation" style="width:100%;border-collapse:collapse;">${rows}</table>
    <p style="margin:24px 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Message</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0306AC;border-radius:8px;padding:16px;color:#0f172a;line-height:1.6;white-space:pre-wrap;word-break:break-word;">${message ? escapeHtml(message) : '<span style="color:#94a3b8;">No message provided</span>'}</div>
    ${extraHtml}
    ${attachHtml}
    <p style="font-size:12px;color:#64748b;margin:28px 0 0;border-top:1px solid #eef2f6;padding-top:12px;">Submitted ${escapeHtml(when)} &middot; Mohsin Designs website. Reply to this email to answer ${escapeHtml(name)} directly.</p>
  </div>
</div>`;

  const text = [
    `NEW ${type.toUpperCase()} - MOHSIN DESIGNS`,
    "----------------------------------",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    ...(subject ? [`Subject: ${subject}`] : []),
    ...(source ? [`Sent from: ${source}`] : []),
    "",
    "MESSAGE:",
    message || "No message provided",
    ...(extraRows.length ? ["", "ADDITIONAL DETAILS:", ...extraRows.map(([k, v]) => `${k}: ${v}`)] : []),
    ...(attachmentUrl ? ["", `Attachment: ${attachmentUrl}`] : attachmentNames && attachmentNames.length ? ["", `Attachment: ${attachmentNames.join(", ")} (attached)`] : []),
    "",
    `Submitted: ${when}`,
  ].join("\n");

  return { html, text };
}
