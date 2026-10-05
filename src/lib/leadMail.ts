// Helpers for /api/send (the shared lead endpoint). Pure functions, no I/O, so they can be
// unit-tested without a DB or mail provider. Only src/app/api/send/route.ts imports this file.

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

/** Loose but safe e-mail check. */
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

/**
 * Builds an ultra-professional, executive-grade lead notification email.
 * Designed with a modern card aesthetic, crisp typography, interactive CTAs,
 * and rock-solid cross-client email compatibility (Gmail, Outlook, Apple Mail).
 */
export function buildLeadEmail(input: LeadEmailInput): { html: string; text: string } {
  const { type, name, email, phone, subject, message, source, extraData, attachmentUrl, attachmentNames } = input;
  
  const dateObj = input.submittedAt || new Date();
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const when = `${formattedDate} at ${formattedTime}`;

  const safeName = escapeHtml(name || "Website Lead");
  const safeEmail = escapeHtml(email || "");
  const safePhone = phone ? escapeHtml(phone) : "";
  const telHref = phone ? escapeHtml(phone.replace(/[^0-9+]/g, "")) : "";
  const safeType = escapeHtml(type || "Lead Inquiry");
  const safeSource = source ? escapeHtml(source) : "";

  // Separate services from other extraData fields for dedicated hero badge styling
  const rawService = extraData?.service || extraData?.services || extraData?.project_type || extraData?.projectType;
  const servicesList: string[] = Array.isArray(rawService)
    ? rawService.map(String)
    : rawService
    ? String(rawService).split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    : [];

  const crmSynced = extraData?.crm_synced === "Yes" || extraData?.crm_synced === true;

  // Filter out service and crm keys from standard extra table since they get dedicated sections
  const excludedKeys = new Set(["service", "services", "project_type", "projecttype", "crm_synced", "crm_status"]);
  const extraRows = Object.entries(extraData || {})
    .filter(([k]) => !excludedKeys.has(k.toLowerCase()))
    .map(([k, v]) => [humanizeKey(k), displayValue(v)] as const)
    .filter(([, v]) => v !== "");

  // Service badges HTML
  const servicesHtml = servicesList.length > 0
    ? `<div style="margin-top:4px;">
        ${servicesList
          .map(
            (srv) =>
              `<span style="display:inline-block;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;margin:3px 4px 3px 0;">${escapeHtml(
                srv
              )}</span>`
          )
          .join("")}
      </div>`
    : "";

  const extraDetailsHtml = extraRows.length > 0
    ? `<div style="margin-top:24px;border-top:1px solid #f1f5f9;padding-top:20px;">
        <h4 style="margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Additional Details</h4>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          ${extraRows
            .map(
              ([label, val]) => `
              <tr>
                <td style="padding:6px 0;width:38%;color:#64748b;font-size:13px;vertical-align:top;">${escapeHtml(label)}</td>
                <td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;word-break:break-word;">${escapeHtml(val)}</td>
              </tr>
            `
            )
            .join("")}
        </table>
      </div>`
    : "";

  const attachmentHtml = attachmentUrl
    ? `<div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;">
        <span style="font-size:13px;font-weight:600;color:#0f172a;">📎 Attachment Available:</span>
        <a href="${escapeHtml(attachmentUrl)}" style="display:inline-block;margin-left:8px;color:#2563eb;font-weight:600;text-decoration:none;font-size:13px;">View / Download File &rarr;</a>
      </div>`
    : attachmentNames && attachmentNames.length
    ? `<div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;font-size:13px;color:#334155;">
        <strong>📎 Attached Files:</strong> ${attachmentNames.map(escapeHtml).join(", ")}
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead: ${safeName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.5;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:620px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(15,23,42,0.08),0 8px 10px -6px rgba(15,23,42,0.04);border:1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:#0f172a;padding:28px 32px 24px;border-bottom:3px solid #E9BD36;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-family:'Segoe UI',Roboto,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.18em;color:#E9BD36;text-transform:uppercase;margin-bottom:6px;">
                      MOHSIN DESIGNS &bull; NEW LEAD
                    </div>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;line-height:1.3;">
                      ${safeType}
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    ${crmSynced ? `
                      <span style="display:inline-block;background:#059669;color:#ffffff;font-size:10px;font-weight:700;letter-spacing:0.06em;padding:4px 10px;border-radius:20px;text-transform:uppercase;">
                        &check; CRM SYNCED
                      </span>
                    ` : `
                      <span style="display:inline-block;background:#334155;color:#94a3b8;font-size:10px;font-weight:700;letter-spacing:0.06em;padding:4px 10px;border-radius:20px;text-transform:uppercase;">
                        LEAD LOGGED
                      </span>
                    `}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Profile Hero Box -->
          <tr>
            <td style="padding:28px 32px 0;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
                <tr>
                  <td>
                    <div style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                      ${safeName}
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width:100%;">
                      <tr>
                        <td style="padding:3px 0;font-size:14px;">
                          <span style="color:#64748b;font-weight:500;">Email:</span>
                          <a href="mailto:${safeEmail}" style="color:#2563eb;font-weight:600;text-decoration:none;margin-left:6px;">${safeEmail}</a>
                        </td>
                      </tr>
                      ${phone ? `
                        <tr>
                          <td style="padding:3px 0;font-size:14px;">
                            <span style="color:#64748b;font-weight:500;">Phone:</span>
                            <a href="tel:${telHref}" style="color:#2563eb;font-weight:600;text-decoration:none;margin-left:6px;">${safePhone}</a>
                          </td>
                        </tr>
                      ` : `
                        <tr>
                          <td style="padding:3px 0;font-size:14px;color:#94a3b8;">
                            Phone: <span style="font-style:italic;">Not provided</span>
                          </td>
                        </tr>
                      `}
                      ${safeSource ? `
                        <tr>
                          <td style="padding:3px 0;font-size:13px;color:#64748b;">
                            Origin: <span style="font-family:monospace;color:#334155;background:#e2e8f0;padding:1px 6px;border-radius:4px;">${safeSource}</span>
                          </td>
                        </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:24px 32px 32px;">
              ${servicesList.length > 0 ? `
                <div style="margin-bottom:20px;">
                  <h4 style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">
                    Requested Services
                  </h4>
                  ${servicesHtml}
                </div>
              ` : ''}

              <!-- Client Message Box -->
              <div style="margin-top:16px;">
                <h4 style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">
                  Client Message / Requirement
                </h4>
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #2430d2;border-radius:8px;padding:18px;color:#1e293b;font-size:14px;line-height:1.65;white-space:pre-wrap;word-break:break-word;">
                  ${message ? escapeHtml(message) : '<span style="color:#94a3b8;font-style:italic;">No written message provided.</span>'}
                </div>
              </div>

              ${extraDetailsHtml}
              ${attachmentHtml}

              <!-- Quick Action Buttons -->
              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="padding:0 6px;">
                      <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(subject || `Your inquiry with Mohsin Designs`)}" style="display:inline-block;background:#2430d2;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px;box-shadow:0 2px 4px rgba(36,48,210,0.2);">
                        &larr; Reply to ${safeName}
                      </a>
                    </td>
                    ${phone && telHref ? `
                      <td style="padding:0 6px;">
                        <a href="tel:${telHref}" style="display:inline-block;background:#f8fafc;color:#0f172a;font-size:13px;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:8px;border:1px solid #cbd5e1;">
                          &phone; Call Client
                        </a>
                      </td>
                    ` : ''}
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer Info -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#64748b;">
                Submitted on <strong>${escapeHtml(when)}</strong>
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                This notification was sent by your website lead engine at <strong>mohsindesigns.com</strong>.<br>
                Security verified with Cloudflare Turnstile &bull; Recorded in Admin Submissions.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `==================================================`,
    `NEW LEAD: ${type.toUpperCase()}`,
    `==================================================`,
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Phone:    ${phone || "Not provided"}`,
    ...(source ? [`Origin:   ${source}`] : []),
    ...(servicesList.length ? [`Services: ${servicesList.join(", ")}`] : []),
    ...(subject ? [`Subject:  ${subject}`] : []),
    crmSynced ? `CRM Sync: Successfully Synced` : ``,
    ``,
    `--------------------------------------------------`,
    `CLIENT MESSAGE:`,
    `--------------------------------------------------`,
    message || "No message provided",
    ``,
    ...(extraRows.length ? [
      `--------------------------------------------------`,
      `ADDITIONAL DETAILS:`,
      `--------------------------------------------------`,
      ...extraRows.map(([k, v]) => `${k}: ${v}`),
      ``,
    ] : []),
    ...(attachmentUrl ? [`Attachment URL: ${attachmentUrl}`] : []),
    ...(attachmentNames && attachmentNames.length ? [`Attachment: ${attachmentNames.join(", ")}`] : []),
    `Submitted: ${when}`,
    `Reply directly to this email to contact ${name}.`,
    `==================================================`,
  ].filter(Boolean).join("\n");

  return { html, text };
}

/**
 * Shared look for both lead e-mails. Table-based and fully inline-styled (Gmail, Outlook and
 * Apple Mail all strip <style> blocks or ignore flex/grid), with a dark-mode override block that
 * Apple Mail / iOS / recent Gmail honour. Brand colours match the website: blue #0306AC, gold #E9BD36.
 */
const EM = {
  blue: '#0306AC',
  blueDeep: '#020478',
  gold: '#E9BD36',
  ink: '#14172B',
  body: '#3A4158',
  muted: '#6B7280',
  line: '#E6E9F2',
  soft: '#F5F6FB',
  page: '#EEF0F7',
  white: '#FFFFFF',
};
const EM_FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

const EM_DARK_CSS = `
  @media (prefers-color-scheme: dark) {
    .em-page { background-color:#0B0A16 !important; }
    .em-card { background-color:#16152A !important; }
    .em-soft { background-color:#1E1D31 !important; }
    .em-ink { color:#F3F4F8 !important; }
    .em-body { color:#C9CDDB !important; }
    .em-muted { color:#9AA1B5 !important; }
    .em-line { border-color:#2C2B45 !important; }
    .em-rule { border-bottom-color:#2C2B45 !important; }
    .em-link { color:#8FA3FF !important; }
  }
`;

const EM_MOBILE_CSS = `
  @media only screen and (max-width:620px){
    .em-container { width:100% !important; }
    .em-px { padding-left:22px !important; padding-right:22px !important; }
    .em-stack { display:block !important; width:100% !important; box-sizing:border-box; }
    .em-h1 { font-size:24px !important; line-height:31px !important; }
  }
`;

function emailDocument(opts: { title: string; preheader: string; inner: string }): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<meta name="x-apple-disable-message-reformatting">
<title>${opts.title}</title>
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,sans-serif !important;}</style><![endif]-->
<style>${EM_DARK_CSS}${EM_MOBILE_CSS}</style>
</head>
<body style="margin:0;padding:0;background-color:${EM.page};font-family:${EM_FONT};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${opts.preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-page" style="background-color:${EM.page};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="em-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
${opts.inner}
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** A label/value row for the details tables (stacks on phones). */
function emRow(label: string, valueHtml: string, last = false): string {
  const border = last ? '' : `border-bottom:1px solid ${EM.line};`;
  const rule = last ? '' : 'em-rule';
  return `<tr>
  <td class="em-stack em-muted ${rule}" width="30%" valign="top" style="padding:14px 20px;${border}font-family:${EM_FONT};font-size:12px;letter-spacing:0.6px;text-transform:uppercase;color:${EM.muted};font-weight:600;">${label}</td>
  <td class="em-stack em-ink ${rule}" valign="top" style="padding:14px 20px;${border}font-family:${EM_FONT};font-size:15px;line-height:22px;color:${EM.ink};">${valueHtml}</td>
</tr>`;
}

/** Full-width or half-width button (half-width ones stack on phones). */
function emButton(href: string, label: string, kind: 'primary' | 'ghost' | 'gold'): string {
  const styles = {
    primary: `background-color:${EM.blue};color:#FFFFFF;border:1px solid ${EM.blue};`,
    ghost: `background-color:${EM.white};color:${EM.blue};border:1px solid #C9D0E6;`,
    gold: `background-color:${EM.gold};color:${EM.ink};border:1px solid ${EM.gold};`,
  }[kind];
  return `<a href="${href}" style="display:block;${styles}border-radius:10px;padding:14px 22px;font-family:${EM_FONT};font-size:15px;font-weight:700;text-decoration:none;text-align:center;">${label}</a>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: new-lead alert to the team
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminLeadEmailInput {
  fullName: string;
  firstName?: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  formSource?: string;
  submittedAt?: Date | string;
  leadId?: string;
  pageUrl?: string;
  crmLeadUrl?: string;
  logoWhiteUrl?: string;
}

/**
 * Builds the internal team notification. Blue header with the logo and a gold "New lead" badge,
 * a headline stating who wants what, one-tap actions (Reply, Call, Open in CRM), the contact
 * details, and the message as a quoted block.
 */
export function buildAdminLeadEmail(input: AdminLeadEmailInput): { html: string; text: string; subject: string } {
  const fullName = cleanText(input.fullName || 'Website Lead', 120) || 'Website Lead';
  const firstName = cleanText(input.firstName || fullName.trim().split(/\s+/)[0] || 'there', 60) || 'there';
  const email = cleanText(input.email || '', 160);
  const phone = cleanText(input.phone || '', 50);
  const service = cleanText(input.service || 'Website Design', 120) || 'Website Design';
  const message = cleanText(input.message || '', 5000);
  const formSource = cleanText(input.formSource || 'Mohsin Designs Website Form', 160) || 'Mohsin Designs Website Form';
  const leadId = cleanText(input.leadId || 'MD-10001', 50) || 'MD-10001';
  const pageUrl = input.pageUrl || 'https://mohsindesigns.com';
  const crmLeadUrl = input.crmLeadUrl || 'https://mohsindesigns.com/admin/submissions';
  const logoWhiteUrl = input.logoWhiteUrl || 'https://mohsindesigns.com/images/logo-white.png';

  const dateObj = typeof input.submittedAt === 'string' ? new Date(input.submittedAt) : (input.submittedAt || new Date());
  const submittedAtStr = `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

  const safeFullName = escapeHtml(fullName);
  const safeFirstName = escapeHtml(firstName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const telHref = escapeHtml(phone.replace(/[^0-9+]/g, ''));
  const safeService = escapeHtml(service);
  const safeFormSource = escapeHtml(formSource);
  const safeSubmittedAt = escapeHtml(submittedAtStr);
  const safeLeadId = escapeHtml(leadId);
  const safePageUrl = escapeHtml(pageUrl);
  const safeCrmLeadUrl = escapeHtml(crmLeadUrl);
  const safeLogoWhiteUrl = escapeHtml(logoWhiteUrl);
  const safeMessageHtml = message
    ? escapeHtml(message).replace(/\r\n|\r|\n/g, '<br>')
    : `<span class="em-muted" style="color:${EM.muted};font-style:italic;">No message was included.</span>`;

  const replyHref = escapeHtml(`mailto:${email}?subject=${encodeURIComponent(`Re: Your ${service} inquiry`)}`);
  const callHref = `tel:${telHref}`;
  const priority = message.length > 0 ? 'Message included' : 'No message';

  const subject = `New lead: ${fullName} · ${service}`;

  // Row 1: reply + CRM side by side (stacked on phones). Row 2: call, only when a phone exists.
  const actionRows = `<tr>
      <td class="em-stack" width="50%" style="padding:0 6px 10px 0;">${emButton(replyHref, `Reply to ${safeFirstName}`, 'primary')}</td>
      <td class="em-stack" width="50%" style="padding:0 0 10px 6px;">${emButton(safeCrmLeadUrl, 'Open in CRM', 'ghost')}</td>
    </tr>${phone ? `<tr>
      <td colspan="2" style="padding:0;">${emButton(escapeHtml(callHref), `Call ${safePhone}`, 'gold')}</td>
    </tr>` : ''}`;

  const inner = `
  <!-- Header -->
  <tr><td class="em-px" style="background-color:${EM.blue};border-radius:16px 16px 0 0;padding:24px 36px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" align="left">
        <img src="${safeLogoWhiteUrl}" alt="Mohsin Designs" width="150" style="display:block;border:0;outline:none;max-width:150px;height:auto;color:#FFFFFF;font-family:${EM_FONT};font-size:18px;font-weight:700;">
      </td>
      <td valign="middle" align="right">
        <span style="display:inline-block;background-color:${EM.gold};color:${EM.ink};border-radius:999px;padding:6px 14px;font-family:${EM_FONT};font-size:11px;font-weight:800;letter-spacing:1px;">&#9679;&nbsp;NEW LEAD</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Body -->
  <tr><td class="em-card em-px" style="background-color:${EM.white};padding:34px 36px 30px 36px;">
    <h1 class="em-h1 em-ink" style="margin:0 0 8px 0;font-family:${EM_FONT};font-size:26px;line-height:33px;font-weight:800;color:${EM.ink};">
      ${safeFullName} wants ${safeService}
    </h1>
    <p class="em-muted" style="margin:0 0 26px 0;font-family:${EM_FONT};font-size:14px;line-height:21px;color:${EM.muted};">
      ${safeFormSource} &middot; ${safeSubmittedAt} &middot; ${priority}
    </p>

    <!-- Actions -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px 0;">
      ${actionRows}
    </table>

    <!-- Contact details -->
    <p class="em-muted" style="margin:0 0 10px 0;font-family:${EM_FONT};font-size:12px;letter-spacing:1px;font-weight:700;color:${EM.muted};">CONTACT DETAILS</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-line" style="border:1px solid ${EM.line};border-radius:12px;">
      ${emRow('Name', safeFullName)}
      ${emRow('Email', `<a href="mailto:${safeEmail}" class="em-link" style="color:${EM.blue};text-decoration:none;font-weight:700;">${safeEmail}</a>`)}
      ${emRow('Phone', phone ? `<a href="${escapeHtml(callHref)}" class="em-link" style="color:${EM.blue};text-decoration:none;font-weight:700;">${safePhone}</a>` : `<span class="em-muted" style="color:${EM.muted};">Not provided</span>`)}
      ${emRow('Service', safeService, true)}
    </table>

    <!-- Message -->
    <p class="em-muted" style="margin:28px 0 10px 0;font-family:${EM_FONT};font-size:12px;letter-spacing:1px;font-weight:700;color:${EM.muted};">MESSAGE</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="em-soft em-body" style="background-color:${EM.soft};border-left:4px solid ${EM.gold};border-radius:0 12px 12px 0;padding:18px 22px;font-family:${EM_FONT};font-size:15px;line-height:24px;color:${EM.body};">
        ${safeMessageHtml}
      </td>
    </tr></table>

    <p class="em-muted" style="margin:26px 0 0 0;font-family:${EM_FONT};font-size:12px;line-height:18px;color:${EM.muted};">
      Lead ID <strong class="em-body" style="color:${EM.body};">${safeLeadId}</strong> &middot; Page <a href="${safePageUrl}" class="em-link" style="color:${EM.blue};text-decoration:none;">${safePageUrl}</a>
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td class="em-soft em-px" style="background-color:${EM.soft};border-radius:0 0 16px 16px;padding:18px 36px;font-family:${EM_FONT};font-size:12px;line-height:18px;color:${EM.muted};">
    Internal notification from the Mohsin Designs website. Please don&#39;t forward outside the team.
  </td></tr>`;

  const text = [
    `NEW LEAD — ${fullName}`,
    `Wants: ${service}`,
    ``,
    `Lead ID:   ${leadId}`,
    `Name:      ${fullName}`,
    `Email:     ${email}`,
    `Phone:     ${phone || 'Not provided'}`,
    `Service:   ${service}`,
    `Source:    ${formSource}`,
    `Page:      ${pageUrl}`,
    `Submitted: ${submittedAtStr}`,
    ``,
    `MESSAGE`,
    message || 'No message was included.',
    ``,
    `Reply:  mailto:${email}?subject=${encodeURIComponent(`Re: Your ${service} inquiry`)}`,
    phone ? `Call:   tel:${telHref}` : '',
    `CRM:    ${crmLeadUrl}`,
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');

  return { html: emailDocument({ title: `New lead — ${safeFullName}`, preheader: `${safeFullName} wants ${safeService}. ${priority}.`, inner }), text, subject };
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER: confirmation receipt
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomerConfirmationEmailInput {
  fullName?: string;
  firstName?: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  leadId?: string;
  bookingUrl?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  logoUrl?: string;
}

/**
 * Builds the customer's confirmation. A white logo bar, a blue hero with a gold check badge,
 * a summary of what they sent (with their reference number), three "what happens next" steps,
 * and a clear next action (book a call, or just reply).
 */
export function buildCustomerConfirmationEmail(input: CustomerConfirmationEmailInput): { html: string; text: string; subject: string } {
  const rawFullName = cleanText(input.fullName || '', 120);
  const firstName = cleanText(input.firstName || (rawFullName ? rawFullName.trim().split(/\s+/)[0] : '') || 'there', 60) || 'there';
  const email = cleanText(input.email || '', 160);
  const phone = cleanText(input.phone || '', 50);
  const service = cleanText(input.service || 'Website Design', 120) || 'Website Design';
  const message = cleanText(input.message || '', 5000);
  const leadId = cleanText(input.leadId || 'MD-10001', 50) || 'MD-10001';
  const bookingUrl = input.bookingUrl || 'https://mohsindesigns.com/contact-us/#book';
  const companyPhone = cleanText(input.companyPhone || '+1 (307) 555-0100', 50) || '+1 (307) 555-0100';
  const companyTelHref = companyPhone.replace(/[^0-9+]/g, '');
  const companyEmail = cleanText(input.companyEmail || 'info@mohsindesigns.com', 160) || 'info@mohsindesigns.com';
  const companyAddress = cleanText(input.companyAddress || 'Mohsin Designs LLC · Sheridan, WY, USA', 200) || 'Mohsin Designs LLC · Sheridan, WY, USA';
  const logoUrl = input.logoUrl || 'https://mohsindesigns.com/images/logo-navy.png';

  const safeFirstName = escapeHtml(firstName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeService = escapeHtml(service);
  const safeLeadId = escapeHtml(leadId);
  const safeBookingUrl = escapeHtml(bookingUrl);
  const safeCompanyPhone = escapeHtml(companyPhone);
  const safeCompanyTelHref = escapeHtml(companyTelHref);
  const safeCompanyEmail = escapeHtml(companyEmail);
  const safeCompanyAddress = escapeHtml(companyAddress);
  const safeLogoUrl = escapeHtml(logoUrl);
  const safeMessageHtml = message
    ? escapeHtml(message).replace(/\r\n|\r|\n/g, '<br>')
    : `<span class="em-muted" style="color:${EM.muted};font-style:italic;">No message included</span>`;

  const subject = `We received your request, ${firstName}`;

  const step = (n: number, title: string, body: string, last = false) => `<tr>
  <td width="48" valign="top" style="padding:0 0 ${last ? '0' : '20px'} 0;">
    <div style="width:34px;height:34px;border-radius:17px;background-color:${EM.gold};font-family:${EM_FONT};font-size:14px;line-height:34px;text-align:center;color:${EM.ink};font-weight:800;">${n}</div>
  </td>
  <td valign="top" style="padding:4px 0 ${last ? '0' : '22px'} 0;font-family:${EM_FONT};font-size:15px;line-height:22px;">
    <div class="em-ink" style="font-weight:700;color:${EM.ink};">${title}</div>
    <div class="em-muted" style="color:${EM.muted};margin-top:2px;">${body}</div>
  </td>
</tr>`;

  const inner = `
  <!-- Logo bar -->
  <tr><td class="em-px" style="background-color:${EM.white};border-radius:16px 16px 0 0;padding:22px 36px;">
    <a href="https://mohsindesigns.com" style="text-decoration:none;">
      <img src="${safeLogoUrl}" alt="Mohsin Designs" width="160" style="display:block;border:0;outline:none;max-width:160px;height:auto;font-family:${EM_FONT};font-size:20px;font-weight:700;color:${EM.blue};">
    </a>
  </td></tr>

  <!-- Hero -->
  <tr><td align="center" class="em-px" style="background-color:${EM.blue};padding:44px 40px 42px 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" width="64" height="64" style="width:64px;height:64px;background-color:${EM.gold};border-radius:32px;font-family:${EM_FONT};font-size:30px;line-height:64px;color:${EM.ink};font-weight:800;">&#10003;</td>
    </tr></table>
    <h1 class="em-h1" style="margin:22px 0 10px 0;font-family:${EM_FONT};font-size:28px;line-height:35px;color:#FFFFFF;font-weight:800;">
      Thanks, ${safeFirstName}. We&#39;ve got it.
    </h1>
    <p style="margin:0;font-family:${EM_FONT};font-size:16px;line-height:24px;color:#D7DCF5;">
      A specialist will reach out within <strong style="color:#FFFFFF;">1 business day</strong>.
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td class="em-card em-px" style="background-color:${EM.white};padding:34px 40px 34px 40px;">
    <p class="em-body" style="margin:0 0 26px 0;font-family:${EM_FONT};font-size:16px;line-height:25px;color:${EM.body};">
      Hi ${safeFirstName}, thanks for reaching out. Here&#39;s a copy of what you sent us, so you have it for your records.
    </p>

    <!-- Summary -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-line" style="border:1px solid ${EM.line};border-radius:12px;">
      <tr><td colspan="2" class="em-soft em-rule" style="background-color:${EM.soft};border-bottom:1px solid ${EM.line};border-radius:12px 12px 0 0;padding:13px 20px;font-family:${EM_FONT};font-size:12px;font-weight:700;letter-spacing:1px;color:${EM.muted};">
        YOUR REQUEST &nbsp;&middot;&nbsp; REF ${safeLeadId}
      </td></tr>
      ${emRow('Service', safeService)}
      ${emRow('Email', safeEmail)}
      ${emRow('Phone', phone ? safePhone : `<span class="em-muted" style="color:${EM.muted};">Not provided</span>`)}
      ${emRow('Message', safeMessageHtml, true)}
    </table>

    <!-- What happens next -->
    <h2 class="em-ink" style="margin:38px 0 18px 0;font-family:${EM_FONT};font-size:18px;line-height:24px;color:${EM.ink};font-weight:800;">What happens next</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${step(1, 'We review your request', 'Our team looks at your business and goals before we call.')}
      ${step(2, 'A specialist contacts you', 'By phone or email within 1 business day.')}
      ${step(3, 'You get a clear plan', 'A tailored proposal with scope, timeline and pricing.', true)}
    </table>

    <!-- Actions -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:34px 0 0 0;"><tr>
      <td align="center" style="padding:0;">
        ${emButton(safeBookingUrl, 'Book a free call', 'primary')}
      </td>
    </tr><tr>
      <td align="center" class="em-muted" style="padding:16px 0 0 0;font-family:${EM_FONT};font-size:14px;line-height:21px;color:${EM.muted};">
        Prefer to talk now? Call <a href="tel:${safeCompanyTelHref}" class="em-link" style="color:${EM.blue};text-decoration:none;font-weight:700;">${safeCompanyPhone}</a><br>
        or simply reply to this email.
      </td>
    </tr></table>

    <p class="em-body em-rule" style="margin:34px 0 0 0;padding-top:26px;border-top:1px solid ${EM.line};font-family:${EM_FONT};font-size:16px;line-height:25px;color:${EM.body};">
      Talk soon,<br><strong class="em-ink" style="color:${EM.ink};">The Mohsin Designs Team</strong>
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" class="em-soft em-px" style="background-color:${EM.soft};border-radius:0 0 16px 16px;padding:26px 40px;font-family:${EM_FONT};font-size:12px;line-height:19px;color:${EM.muted};">
    <a href="https://mohsindesigns.com" class="em-link" style="color:${EM.blue};text-decoration:none;font-weight:700;">mohsindesigns.com</a>
    &nbsp;&middot;&nbsp; <a href="mailto:${safeCompanyEmail}" class="em-muted" style="color:${EM.muted};text-decoration:none;">${safeCompanyEmail}</a><br>
    ${safeCompanyAddress}<br><br>
    You&#39;re getting this because you submitted a form on our website. If that wasn&#39;t you, you can safely ignore this email.
  </td></tr>`;

  const text = [
    `Thanks, ${firstName}. We've got your request.`,
    ``,
    `A specialist will reach out within 1 business day.`,
    ``,
    `YOUR REQUEST (REF ${leadId})`,
    `Service: ${service}`,
    `Email:   ${email}`,
    `Phone:   ${phone || 'Not provided'}`,
    `Message: ${message || 'No message included'}`,
    ``,
    `WHAT HAPPENS NEXT`,
    `1. We review your request: our team looks at your business and goals before we call.`,
    `2. A specialist contacts you: by phone or email within 1 business day.`,
    `3. You get a clear plan: a tailored proposal with scope, timeline and pricing.`,
    ``,
    `Want to skip the wait? Book a free call:`,
    bookingUrl,
    ``,
    `Prefer to talk now? Call ${companyPhone} or just reply to this email.`,
    ``,
    `Talk soon,`,
    `The Mohsin Designs Team`,
    `https://mohsindesigns.com · ${companyEmail}`,
    companyAddress,
  ].join('\n');

  return { html: emailDocument({ title: 'We received your request — Mohsin Designs', preheader: `Thanks ${firstName} — a specialist will contact you within 1 business day.`, inner }), text, subject };
}
