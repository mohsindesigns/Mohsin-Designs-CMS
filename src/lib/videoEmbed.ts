// Turns a pasted YouTube/Vimeo URL into a SAFE embeddable iframe src (or "" if it isn't
// one). Same approach as src/lib/mapEmbed.ts: only known video-host hostnames are ever
// allowed through, so a pasted value can never embed an arbitrary site.

const ALLOWED_HOSTS = [
  /(^|\.)youtube\.com$/i,
  /(^|\.)youtube-nocookie\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)vimeo\.com$/i,
];

function extractYouTubeId(url: URL): string {
  if (/youtu\.be$/i.test(url.hostname)) {
    return url.pathname.replace(/^\//, "").split("/")[0] || "";
  }
  if (/^\/embed\//.test(url.pathname)) {
    return url.pathname.split("/embed/")[1]?.split("/")[0] || "";
  }
  if (/^\/shorts\//.test(url.pathname)) {
    return url.pathname.split("/shorts/")[1]?.split("/")[0] || "";
  }
  return url.searchParams.get("v") || "";
}

function extractVimeoId(url: URL): string {
  // player.vimeo.com/video/12345678 or vimeo.com/12345678 (optionally with a private hash)
  const parts = url.pathname.split("/").filter(Boolean);
  const idPart = parts.find((p) => /^\d+$/.test(p));
  return idPart || "";
}

export function parseVideoEmbed(input?: string | null): { embedUrl: string; provider: "youtube" | "vimeo" | "" } {
  if (!input || typeof input !== "string") return { embedUrl: "", provider: "" };
  let value = input.trim();
  if (!value) return { embedUrl: "", provider: "" };

  // Allow a pasted <iframe> embed snippet too, same as the map embed field.
  if (/<iframe/i.test(value)) {
    const m = value.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!m) return { embedUrl: "", provider: "" };
    value = m[1].trim();
  }
  value = value.replace(/&amp;/g, "&");

  if (!/^https?:\/\//i.test(value)) return { embedUrl: "", provider: "" };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { embedUrl: "", provider: "" };
  }
  if (url.protocol !== "https:") return { embedUrl: "", provider: "" };
  if (!ALLOWED_HOSTS.some((re) => re.test(url.hostname))) return { embedUrl: "", provider: "" };

  if (/youtube|youtu\.be/i.test(url.hostname)) {
    const id = extractYouTubeId(url);
    if (!id || !/^[\w-]{6,15}$/.test(id)) return { embedUrl: "", provider: "" };
    return { embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, provider: "youtube" };
  }

  if (/vimeo/i.test(url.hostname)) {
    const id = extractVimeoId(url);
    if (!id) return { embedUrl: "", provider: "" };
    return { embedUrl: `https://player.vimeo.com/video/${id}`, provider: "vimeo" };
  }

  return { embedUrl: "", provider: "" };
}

// Best-effort thumbnail for a YouTube link (Vimeo has no equivalent no-key API), used as
// a fallback card image when the admin hasn't set an explicit thumbnail.
export function youtubeThumbnail(embedUrlOrRaw?: string | null): string {
  const { embedUrl, provider } = parseVideoEmbed(embedUrlOrRaw);
  if (provider !== "youtube" || !embedUrl) return "";
  const id = embedUrl.split("/embed/")[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}
