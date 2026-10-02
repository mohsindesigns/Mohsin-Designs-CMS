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
