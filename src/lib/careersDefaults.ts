/**
 * Single source of truth for the Careers page copy that shows when a field is left blank.
 *
 * Used by BOTH `CareersTemplate` (public page fallbacks) and `CareersEditor` (seed values and
 * input placeholders) so the admin always sees exactly what visitors will see - no drift between
 * "what the editor says" and "what the page really shows".
 * Only the Careers template/editor import this file.
 */

export const CAREERS_DEFAULTS = {
  section: {
    badge: "Join Mohsin Designs",
    headline: "Expert hands with Visionary minds",
    description:
      "<p>Build your future with a team that values innovation, creativity, and craftsmanship.</p>",
  },
  success: {
    title: "Application Received",
    description:
      "<p>Thank you for your interest. Our recruitment team will review your profile and reach out shortly.</p>",
  },
  labels: {
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    role: "Position Applied For",
    roleSelector: "Select a Position",
    attachment: "Resume / CV",
    attachmentPlaceholder: "Upload your resume (PDF or Word, up to 10MB)",
    summary: "Tell us about your experience",
    submit: "Submit Application",
    submitting: "Sending...",
  },
  /** Sample positions the editor seeds into a brand-new Careers page (admin can edit/remove). */
  roles: [
    { label: "Senior Web Developer", value: "web-developer" },
    { label: "SEO & Growth Strategist", value: "seo-strategist" },
    { label: "UI/UX Designer", value: "ui-ux-designer" },
  ],
} as const;

export type CareersLabelKey = keyof typeof CAREERS_DEFAULTS.labels;

/** Order + admin-facing description of every editable form label (editor "Submission Flow" tab). */
export const CAREERS_LABEL_FIELDS: { key: CareersLabelKey; title: string; help: string }[] = [
  { key: "name", title: "Full name field", help: "Label above the name input." },
  { key: "email", title: "Email field", help: "Label above the email input." },
  { key: "phone", title: "Phone field", help: "Label above the phone input." },
  { key: "role", title: "Position field", help: "Label above the position dropdown (only shown when positions exist and are visible)." },
  { key: "roleSelector", title: "Position dropdown placeholder", help: "Text shown in the dropdown before a position is chosen." },
  { key: "attachment", title: "Resume field", help: "Label above the resume upload box." },
  { key: "attachmentPlaceholder", title: "Resume upload placeholder", help: "Text inside the upload box before a file is chosen." },
  { key: "summary", title: "Message field", help: "Label above the free-text message box." },
  { key: "submit", title: "Submit button", help: "Button text." },
  { key: "submitting", title: "Submit button (while sending)", help: "Button text while the application is being sent." },
];

/** Resume limits enforced by /api/send (kept here so the form can validate before uploading). */
export const CAREERS_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
export const CAREERS_RESUME_MAX_BYTES = 10 * 1024 * 1024; // 10MB, same cap as the API route

/** Slug used as the internal value of a position when none was saved (or two share a value). */
export const slugifyRole = (label: string) =>
  label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "position";
