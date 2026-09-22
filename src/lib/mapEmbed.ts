// Turns whatever an admin pastes into a SAFE map iframe src (or "" if it isn't one).
// Accepts:
//   - a full <iframe ... src="..."> snippet (Google Maps "Share > Embed a map")
//   - an embed URL
//   - a plain place name / address ("Dallas, Texas, USA") -> Google Maps keyless embed
// Only https URLs on known map providers are allowed, so a pasted value can never
// embed an arbitrary site.

const ALLOWED_HOSTS = [
  /(^|\.)google\.com$/i,
  /(^|\.)openstreetmap\.org$/i,
  /(^|\.)bing\.com$/i,
  /(^|\.)mapbox\.com$/i,
  /(^|\.)arcgis\.com$/i,
  /(^|\.)mapquest\.com$/i,
];

export function parseMapEmbed(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  let value = input.trim();
  if (!value) return "";

  // Full <iframe> snippet -> pull out src
  if (/<iframe/i.test(value)) {
    const m = value.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!m) return "";
    value = m[1].trim();
  }
  value = value.replace(/&amp;/g, "&");

  // Not a URL: treat as a place name / address
  if (!/^https?:\/\//i.test(value)) {
    if (/[<>{}]/.test(value) || value.length > 200) return "";
    return `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    if (!ALLOWED_HOSTS.some((re) => re.test(url.hostname))) return "";
    return url.toString();
  } catch {
    return "";
  }
}
