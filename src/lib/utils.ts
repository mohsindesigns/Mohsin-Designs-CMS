import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures all external/internal links in HTML string are "dofollow" by stripping "nofollow" from rel attribute.
 */
export function makeLinksDoFollow(html: string): string {
  if (!html) return html;
  
  // Target any <a> tag
  return html.replace(/<a\s+([^>]*?)>/gi, (match: string, attrs: string) => {
    // Check if the tag has a rel attribute
    const relRegex = /rel=(['"])(.*?)\1/gi;
    if (relRegex.test(attrs)) {
      // Clean the rel attribute
      const cleanedAttrs = attrs.replace(relRegex, (relMatch: string, quote: string, relValue: string) => {
        const cleanRel = relValue
          .split(/\s+/)
          .filter((val: string) => val.toLowerCase() !== 'nofollow')
          .join(' ')
          .trim();
        return cleanRel ? `rel=${quote}${cleanRel}${quote}` : '';
      });
      // Replace multiple spaces with a single space and trim
      const tidiedAttrs = cleanedAttrs.replace(/\s+/g, ' ').trim();
      return tidiedAttrs ? `<a ${tidiedAttrs}>` : '<a>';
    }
    return match;
  });
}

/**
 * Repairs broken UTF-8 CP1252/Windows-1252 Mojibake encoding character patterns.
 */
export function cleanMojibake(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .replace(/ΓÇö/g, '—')  // em dash
    .replace(/ΓÇô/g, '–')  // en dash
    .replace(/ΓÇÖ/g, '’')  // curly apostrophe/single quote
    .replace(/ΓÇÿ/g, '‘')  // curly single quote open
    .replace(/ΓÇ£/g, '“')  // curly double quote open
    .replace(/ΓÇØ/g, '”')  // curly double quote close
    .replace(/ΓÇ¢/g, '•')  // bullet point
    .replace(/ΓÇª/g, '…')  // ellipsis
    .replace(/┬á/g, ' ')   // non-breaking space
    .replace(/├⌐/g, 'é')   // e-acute
    .replace(/├│/g, 'ó')   // o-acute
    .replace(/├á/g, 'à')   // a-grave
    .replace(/├¡/g, 'í')   // i-acute
    .replace(/├║/g, 'ú')   // u-acute
    .replace(/├▒/g, 'ñ')   // n-tilde
    .replace(/├ç/g, 'Ç')   // C-cedilla
    .replace(/├ä/g, 'Ä')   // A-umlaut
    .replace(/├ö/g, 'Ö')   // O-umlaut
    .replace(/├╝/g, 'ü')   // u-umlaut
    .replace(/├ñ/g, 'ä')   // a-umlaut
    .replace(/├╢/g, 'ö')   // o-umlaut
    .replace(/├ƒ/g, 'ß')   // eszett
    .replace(/┬░/g, '°')   // degree symbol
    .replace(/┬⌐/g, '©')   // copyright
    .replace(/┬«/g, '®')   // registered
    .replace(/Γäó/g, '™')  // trademark
    .replace(/ΓÇï/g, '')   // zero width space
    .replace(/ΓÇì/g, '')   // zero width joiner
    .replace(/ΓÇî/g, '')   // zero width non-joiner
    .replace(/ΓÇ/g, '');   // fallback residual markers
}

/**
 * Repairs broken UTF-8 CP1252/Windows-1252 Mojibake encoding character patterns recursively.
 */
export function sanitizeEncoding(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return cleanMojibake(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeEncoding(item));
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      res[key] = sanitizeEncoding(obj[key]);
    }
    return res;
  }
  return obj;
}

