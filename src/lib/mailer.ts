import nodemailer, { type Transporter } from "nodemailer";

// ─────────────────────────────────────────────────────────────────────────────
// The ONE outbound e-mail transport for the whole site (lead notifications from
// /api/send, admin password resets, ...). Configured purely from env:
//
//   SMTP_HOST   smtp-relay.brevo.com
//   SMTP_PORT   587 (STARTTLS) - 465 switches to implicit TLS automatically
//   SMTP_USER   Brevo SMTP login
//   SMTP_PASS   Brevo SMTP key (xsmtpsib-...)
//   MAIL_FROM   "Mohsin Designs <you@yourdomain.com>" - MUST be a sender verified
//               in Brevo, otherwise the relay rejects the message.
//
// Nothing else in the codebase should create its own transporter.
// ─────────────────────────────────────────────────────────────────────────────

export interface MailAttachment {
  filename: string;
  /** Raw bytes, or a base64 string when `encoding` is "base64". */
  content: Buffer | string;
  encoding?: "base64";
  contentType?: string;
}

export interface MailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}

export function isMailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** Sender shown to the recipient. Falls back to the SMTP login so a misconfigured env still sends. */
export function mailFrom(): string {
  return process.env.MAIL_FROM || `"Mohsin Designs" <${process.env.SMTP_USER}>`;
}

let cached: Transporter | null = null;

function transporter(): Transporter {
  if (cached) return cached;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587/25 = STARTTLS (upgraded automatically)
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
  return cached;
}

/**
 * Sends one message. Throws on transport/auth/relay errors so callers can decide whether the
 * failure is fatal (password reset) or just logged (lead already stored in the DB).
 */
export async function sendMail(msg: MailMessage): Promise<{ messageId: string }> {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)");
  }
  const info = await transporter().sendMail({
    from: mailFrom(),
    to: msg.to,
    replyTo: msg.replyTo,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    attachments: msg.attachments,
  });
  return { messageId: info.messageId };
}
