// Form Input Sanitization Utility
// Strips and neutralizes HTML, scripts, javascript: URIs, and dangerous attributes to prevent XSS / JS injection in form submissions.

/**
 * Strips script tags, javascript: pseudo-protocols, inline event handlers (on*), and HTML tags.
 */
export function sanitizeFormString(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'string') return String(val);

  let cleaned = val;

  // 1. Remove script tags and their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove style tags and their content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Remove javascript: and vbscript: URIs
  cleaned = cleaned.replace(/javascript\s*:/gi, '');
  cleaned = cleaned.replace(/vbscript\s*:/gi, '');
  cleaned = cleaned.replace(/data\s*:\s*text\/html/gi, '');

  // 4. Remove inline event handlers (onerror=, onload=, onclick=, etc.)
  cleaned = cleaned.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 5. Strip remaining HTML tags
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');

  return cleaned.trim();
}

/**
 * Recursively sanitizes all properties in an object or array.
 */
export function sanitizeFormData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeFormString(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeFormData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeFormString(key);
      sanitizedObj[sanitizedKey] = sanitizeFormData(value);
    }
    return sanitizedObj as T;
  }

  return data;
}
