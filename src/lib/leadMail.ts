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
 * Builds the internal team notification email (admin-new-lead.html).
 * Features high-contrast dark header, status pill, contact details table,
 * message callout, and 1-click CTA buttons (Reply to Lead & View in CRM).
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

  const dateObj = typeof input.submittedAt === 'string'
    ? new Date(input.submittedAt)
    : (input.submittedAt || new Date());
  
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const submittedAtStr = `${formattedDate} at ${formattedTime}`;

  const safeFullName = escapeHtml(fullName);
  const safeFirstName = escapeHtml(firstName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const telHref = phone ? escapeHtml(phone.replace(/[^0-9+]/g, '')) : '';
  const safeService = escapeHtml(service);
  const safeFormSource = escapeHtml(formSource);
  const safeSubmittedAt = escapeHtml(submittedAtStr);
  const safeLeadId = escapeHtml(leadId);
  const safePageUrl = escapeHtml(pageUrl);
  const safeCrmLeadUrl = escapeHtml(crmLeadUrl);
  const safeLogoWhiteUrl = escapeHtml(logoWhiteUrl);
  const safeMessageHtml = message
    ? escapeHtml(message).replace(/\r\n|\r|\n/g, '<br>')
    : '<span style="color:#7A8296;font-style:italic;">No message provided.</span>';

  const subject = `New lead: ${fullName} · ${service}`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>New Lead — ${safeFullName}</title>
<!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
<style>
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .stack{display:block !important;width:100% !important;}
    .label-cell{padding-bottom:2px !important;}
    .btn a{display:block !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F6;-webkit-font-smoothing:antialiased;">
<!-- Preheader (shows in inbox preview, hidden in body) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
  ${safeFullName} requested ${safeService} — reply within 1 hour for the best close rate.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF1F6;">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Header bar -->
    <tr><td style="background-color:#0B1F4B;border-radius:10px 10px 0 0;padding:22px 36px;" class="px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td align="left" valign="middle">
          <img src="${safeLogoWhiteUrl}" alt="Mohsin Designs" width="150" style="display:block;border:0;outline:none;max-width:150px;height:auto;color:#ffffff;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;">
        </td>
        <td align="right" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#A9B6D3;letter-spacing:0.5px;">
          INTERNAL&nbsp;·&nbsp;LEAD&nbsp;ALERT
        </td>
      </tr></table>
    </td></tr>

    <!-- Body card -->
    <tr><td style="background-color:#FFFFFF;padding:36px 36px 8px 36px;" class="px">

      <!-- Status pill -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background-color:#E7F6EC;border-radius:20px;padding:6px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#1E7A3E;letter-spacing:0.8px;">
          &#9679;&nbsp;NEW LEAD
        </td>
      </tr></table>

      <h1 style="margin:18px 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:32px;color:#0B1F4B;font-weight:bold;">
        ${safeFullName} is interested in ${safeService}
      </h1>
      <p style="margin:0 0 26px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#5B6478;">
        Submitted via <strong style="color:#2B3245;">${safeFormSource}</strong> on ${safeSubmittedAt}
      </p>

      <!-- Details table -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E8F0;border-radius:8px;">
        <tr><td colspan="2" style="background-color:#F6F8FB;border-bottom:1px solid #E3E8F0;border-radius:8px 8px 0 0;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#5B6478;letter-spacing:1px;">
          CONTACT DETAILS
        </td></tr>
        <tr>
          <td class="stack label-cell" width="34%" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Full name</td>
          <td class="stack" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;font-weight:bold;">${safeFullName}</td>
        </tr>
        <tr>
          <td class="stack label-cell" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Email</td>
          <td class="stack" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#1F5BD8;text-decoration:none;font-weight:bold;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td class="stack label-cell" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Phone</td>
          <td class="stack" style="padding:14px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;">${phone ? `<a href="tel:${telHref}" style="color:#1F5BD8;text-decoration:none;font-weight:bold;">${safePhone}</a>` : `<span style="color:#7A8296;">Not provided</span>`}</td>
        </tr>
        <tr>
          <td class="stack label-cell" style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Service</td>
          <td class="stack" style="padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;font-weight:bold;">${safeService}</td>
        </tr>
      </table>

      <!-- Message -->
      <p style="margin:26px 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#5B6478;letter-spacing:1px;">MESSAGE</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background-color:#F6F8FB;border-left:3px solid #0B1F4B;border-radius:0 6px 6px 0;padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#2B3245;">
          ${safeMessageHtml}
        </td>
      </tr></table>

      <!-- Actions -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr>
        <td class="stack btn" style="padding:0 6px 10px 0;" width="50%">
          <a href="mailto:${safeEmail}?subject=Re:%20Your%20${encodeURIComponent(service)}%20inquiry" style="display:block;background-color:#0B1F4B;border-radius:6px;padding:14px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Reply to ${safeFirstName}</a>
        </td>
        <td class="stack btn" style="padding:0 0 10px 6px;" width="50%">
          <a href="${safeCrmLeadUrl}" style="display:block;background-color:#FFFFFF;border:1px solid #C9D1E0;border-radius:6px;padding:13px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#0B1F4B;text-decoration:none;">View in CRM</a>
        </td>
      </tr></table>

      <!-- Meta strip -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 28px 0;border-top:1px solid #EEF1F6;"><tr>
        <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8A92A6;">
          Lead ID: <strong style="color:#5B6478;">${safeLeadId}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;Page: <a href="${safePageUrl}" style="color:#5B6478;">${safePageUrl}</a>
        </td>
      </tr></table>

    </td></tr>

    <!-- Footer -->
    <tr><td style="background-color:#F6F8FB;border-radius:0 0 10px 10px;border-top:1px solid #E3E8F0;padding:20px 36px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8A92A6;" class="px">
      Automated internal notification from the Mohsin Designs website. Do not forward outside the team.
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `==================================================`,
    `INTERNAL ALERT · NEW LEAD`,
    `==================================================`,
    `Lead ID:      ${leadId}`,
    `Full Name:    ${fullName}`,
    `Email:        ${email}`,
    `Phone:        ${phone || 'Not provided'}`,
    `Service:      ${service}`,
    `Origin:       ${formSource}`,
    `Page URL:     ${pageUrl}`,
    `Submitted At: ${submittedAtStr}`,
    ``,
    `--------------------------------------------------`,
    `MESSAGE:`,
    `--------------------------------------------------`,
    message || 'No message provided',
    `--------------------------------------------------`,
    ``,
    `Reply to Lead: mailto:${email}?subject=Re:%20Your%20${encodeURIComponent(service)}%20inquiry`,
    `View in CRM:   ${crmLeadUrl}`,
    `==================================================`,
  ].join('\n');

  return { html, text, subject };
}

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
 * Builds the customer-facing inquiry confirmation email (customer-confirmation.html).
 * Features a branded checkmark hero card, summary card of their submission,
 * 3-step 'What happens next' timeline, direct booking CTA, and direct reply options.
 */
export function buildCustomerConfirmationEmail(input: CustomerConfirmationEmailInput): { html: string; text: string; subject: string } {
  const rawFullName = cleanText(input.fullName || '', 120);
  const firstName = cleanText(
    input.firstName || (rawFullName ? rawFullName.trim().split(/\s+/)[0] : '') || 'there',
    60
  ) || 'there';
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
    : '<span style="color:#7A8296;font-style:italic;">No message provided.</span>';

  const subject = `We received your request, ${firstName}`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>We received your request — Mohsin Designs</title>
<!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
<style>
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:24px !important;padding-right:24px !important;}
    .stack{display:block !important;width:100% !important;}
    .step-num{padding-bottom:8px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F6;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
  Thanks ${safeFirstName} — a specialist will contact you within 1 business day.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF1F6;">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Logo -->
    <tr><td align="center" style="padding:0 0 22px 0;">
      <a href="https://mohsindesigns.com" style="text-decoration:none;">
        <img src="${safeLogoUrl}" alt="Mohsin Designs" width="170" style="display:block;border:0;outline:none;max-width:170px;height:auto;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#0B1F4B;">
      </a>
    </td></tr>

    <!-- Hero -->
    <tr><td align="center" style="background-color:#0B1F4B;border-radius:10px 10px 0 0;padding:44px 40px 40px 40px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td align="center" width="56" height="56" style="width:56px;height:56px;background-color:#1E7A3E;border-radius:28px;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:56px;color:#FFFFFF;font-weight:bold;">&#10003;</td>
      </tr></table>
      <h1 style="margin:22px 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:34px;color:#FFFFFF;font-weight:bold;">
        Thanks, ${safeFirstName} — we&#39;ve got your request
      </h1>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#C3CDE3;">
        Our ${safeService} team will reach out within <strong style="color:#FFFFFF;">1 business day</strong>.
      </p>
    </td></tr>

    <!-- Body -->
    <tr><td style="background-color:#FFFFFF;padding:36px 40px 12px 40px;" class="px">

      <p style="margin:0 0 26px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#2B3245;">
        Hi ${safeFirstName},<br><br>
        Thank you for contacting Mohsin Designs. We&#39;ve received your inquiry and our team is already reviewing it. Here&#39;s a copy of what you sent us for your records.
      </p>

      <!-- Summary -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E3E8F0;border-radius:8px;">
        <tr><td colspan="2" style="background-color:#F6F8FB;border-bottom:1px solid #E3E8F0;border-radius:8px 8px 0 0;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#5B6478;letter-spacing:1px;">
          YOUR REQUEST &nbsp;·&nbsp; REF ${safeLeadId}
        </td></tr>
        <tr>
          <td class="stack" width="34%" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Service</td>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;font-weight:bold;">${safeService}</td>
        </tr>
        <tr>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Email</td>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;">${safeEmail}</td>
        </tr>
        <tr>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Phone</td>
          <td class="stack" style="padding:13px 20px;border-bottom:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A2033;">${phone ? safePhone : 'Not provided'}</td>
        </tr>
        <tr>
          <td class="stack" valign="top" style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A8296;">Message</td>
          <td class="stack" style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#1A2033;">${safeMessageHtml}</td>
        </tr>
      </table>

      <!-- What happens next -->
      <h2 style="margin:34px 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:24px;color:#0B1F4B;font-weight:bold;">What happens next</h2>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="step-num" width="44" valign="top" style="padding-bottom:18px;">
            <div style="width:30px;height:30px;border-radius:15px;background-color:#E8EDF7;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:30px;text-align:center;color:#0B1F4B;font-weight:bold;">1</div>
          </td>
          <td valign="top" style="padding-bottom:18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#5B6478;">
            <strong style="color:#1A2033;">We review your request</strong><br>Our team looks at your business and goals before we call.
          </td>
        </tr>
        <tr>
          <td width="44" valign="top" style="padding-bottom:18px;">
            <div style="width:30px;height:30px;border-radius:15px;background-color:#E8EDF7;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:30px;text-align:center;color:#0B1F4B;font-weight:bold;">2</div>
          </td>
          <td valign="top" style="padding-bottom:18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#5B6478;">
            <strong style="color:#1A2033;">A specialist contacts you</strong><br>By phone or email within 1 business day.
          </td>
        </tr>
        <tr>
          <td width="44" valign="top" style="padding-bottom:6px;">
            <div style="width:30px;height:30px;border-radius:15px;background-color:#E8EDF7;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:30px;text-align:center;color:#0B1F4B;font-weight:bold;">3</div>
          </td>
          <td valign="top" style="padding-bottom:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#5B6478;">
            <strong style="color:#1A2033;">You get a clear plan</strong><br>A tailored proposal with scope, timeline and pricing.
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 8px 0;"><tr>
        <td align="center">
          <a href="${safeBookingUrl}" style="display:inline-block;background-color:#0B1F4B;border-radius:6px;padding:15px 34px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Book a call now</a>
        </td>
      </tr><tr>
        <td align="center" style="padding-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8A92A6;">
          Can&#39;t wait? Reply to this email or call <a href="tel:${safeCompanyTelHref}" style="color:#1F5BD8;text-decoration:none;">${safeCompanyPhone}</a>
        </td>
      </tr></table>

      <p style="margin:30px 0 30px 0;padding-top:24px;border-top:1px solid #EEF1F6;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#2B3245;">
        Talk soon,<br><strong style="color:#0B1F4B;">The Mohsin Designs Team</strong>
      </p>

    </td></tr>

    <!-- Footer -->
    <tr><td align="center" style="background-color:#F6F8FB;border-radius:0 0 10px 10px;border-top:1px solid #E3E8F0;padding:24px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#8A92A6;" class="px">
      <a href="https://mohsindesigns.com" style="color:#0B1F4B;text-decoration:none;font-weight:bold;">mohsindesigns.com</a>
      &nbsp;·&nbsp; <a href="mailto:${safeCompanyEmail}" style="color:#5B6478;text-decoration:none;">${safeCompanyEmail}</a><br>
      ${safeCompanyAddress}<br><br>
      You&#39;re receiving this because you submitted a form on our website. If this wasn&#39;t you, please ignore this email.
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `Hi ${firstName},`,
    ``,
    `Thank you for contacting Mohsin Designs. We've received your inquiry and our team is already reviewing it. Here's a copy of what you sent us for your records:`,
    ``,
    `--------------------------------------------------`,
    `YOUR REQUEST · REF ${leadId}`,
    `--------------------------------------------------`,
    `Service: ${service}`,
    `Email:   ${email}`,
    `Phone:   ${phone || 'Not provided'}`,
    `Message: ${message || 'No message provided'}`,
    ``,
    `--------------------------------------------------`,
    `WHAT HAPPENS NEXT:`,
    `--------------------------------------------------`,
    `1. We review your request — Our team looks at your business and goals before we call.`,
    `2. A specialist contacts you — By phone or email within 1 business day.`,
    `3. You get a clear plan — A tailored proposal with scope, timeline and pricing.`,
    ``,
    `Want to fast-track? Book a call directly:`,
    `${bookingUrl}`,
    ``,
    `Can't wait? Reply to this email or call ${companyPhone}.`,
    ``,
    `Talk soon,`,
    `The Mohsin Designs Team`,
    `https://mohsindesigns.com · ${companyEmail}`,
    `${companyAddress}`,
  ].join('\n');

  return { html, text, subject };
}

