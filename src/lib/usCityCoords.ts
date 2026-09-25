// Pure data. [lat, lng] of the U.S. cities that State pages list as Service Area hubs, keyed by
// state slug then by city slug.
//
// Why this exists: <ServiceArea>/<RealWorldMap> place a hub by looking its NAME up in
// lib/countryLocations (countries + states only). City names miss that table and land at the
// (20N, 0E) fallback in the Atlantic, or resolve to the wrong place ("Jackson" -> Mississippi,
// "Athens" -> Greece, "Columbus" -> Ohio). Keying by state slug removes the ambiguity.
// Ideally this table is folded into countryLocations.ts (see the audit report); until then
// StateTemplate uses it to give each city hub real coordinates.
export const US_CITY_COORDS: Record<string, Record<string, [number, number]>> = {
  nevada: {
    henderson: [36.0395, -114.9817], "las-vegas": [36.1699, -115.1398], reno: [39.5296, -119.8138],
    winchester: [36.133, -115.124], "carson-city": [39.1638, -119.7674],
  },
  wyoming: {
    gillette: [44.2911, -105.5022], casper: [42.8501, -106.3252], sheridan: [44.7972, -106.9562],
    powell: [44.7536, -108.7568], jackson: [43.4799, -110.7624], cheyenne: [41.14, -104.8202],
  },
  colorado: {
    "colorado-springs": [38.8339, -104.8214], springs: [38.8339, -104.8214], denver: [39.7392, -104.9903],
    brighton: [39.9853, -104.8205], boulder: [40.015, -105.2705], aurora: [39.7294, -104.8319],
  },
  "south-carolina": {
    "rock-hill": [34.9249, -81.0251], columbia: [34.0007, -81.0348], charleston: [32.7765, -79.9311],
    greenville: [34.8526, -82.394], "mount-pleasant": [32.8323, -79.8284],
  },
  oklahoma: {
    tulsa: [36.154, -95.9928], edmond: [35.6528, -97.4781], ardmore: [34.1743, -97.1436],
    mustang: [35.3842, -97.7245], norman: [35.2226, -97.4395], "oklahoma-city": [35.4676, -97.5164],
  },
  "north-carolina": {
    charlotte: [35.2271, -80.8431], raleigh: [35.7796, -78.6382], asheville: [35.5951, -82.5515],
    durham: [35.994, -78.8986], greensboro: [36.0726, -79.792],
  },
  ohio: {
    toledo: [41.6528, -83.5379], cleveland: [41.4993, -81.6944], dayton: [39.7589, -84.1916],
    cincinnati: [39.1031, -84.512], hamilton: [39.3995, -84.5613], columbus: [39.9612, -82.9988],
  },
  georgia: {
    athens: [33.9519, -83.3576], atlanta: [33.749, -84.388], savannah: [32.0809, -81.0912],
    roswell: [34.0232, -84.3616], columbus: [32.461, -84.9877],
  },
  florida: {
    jacksonville: [30.3322, -81.6557], miami: [25.7617, -80.1918], tampa: [27.9506, -82.4572],
    orlando: [28.5383, -81.3792], "st-petersburg": [27.7676, -82.6403],
  },
  texas: {
    "fort-worth": [32.7555, -97.3308], austin: [30.2672, -97.7431], dallas: [32.7767, -96.797],
    houston: [29.7604, -95.3698], plano: [33.0198, -96.6989], "san-antonio": [29.4241, -98.4936],
  },
};

const slug = (s: string) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Coordinates for a hub inside `stateSlug`, trying each candidate (hub link's last segment, the
 * hub name, and the name minus a trailing 2-letter state code such as "Edmond OK").
 * Returns null when the city is not in the table.
 */
export function lookupUsCity(stateSlug: string, ...candidates: Array<string | undefined>): [number, number] | null {
  const table = US_CITY_COORDS[slug(stateSlug)];
  if (!table) return null;
  for (const raw of candidates) {
    if (!raw) continue;
    const s = slug(raw);
    if (table[s]) return table[s];
    const noCode = s.replace(/-[a-z]{2}$/, ""); // "edmond-ok" -> "edmond", "st-petersburg-fl" -> "st-petersburg"
    if (noCode !== s && table[noCode]) return table[noCode];
  }
  return null;
}
