// Comprehensive country and city coordinates database mapped to Equirectangular projection (0-1000, 0-500)

export interface CountryLocation {
  name: string;
  code: string;
  lat: number;
  lng: number;
  x: number; // ViewBox x (0 to 1000)
  y: number; // ViewBox y (0 to 500)
  timezone: string;
  region: string;
}

// Convert Latitude and Longitude to standard Equirectangular ViewBox percentage/points (1000x500)
export function latLngToCoords(lat: number, lng: number): { xPercent: string; yPercent: string; xPoint: number; yPoint: number } {
  // Standard Miller / Equirectangular projection mapping
  const x = ((lng + 180) / 360) * 1000;
  // Lat projection with slight aesthetic compression for polar areas
  const y = ((90 - lat) / 180) * 500;
  return {
    xPercent: `${((x / 1000) * 100).toFixed(2)}%`,
    yPercent: `${((y / 500) * 100).toFixed(2)}%`,
    xPoint: Math.round(x),
    yPoint: Math.round(y),
  };
}

export const COUNTRIES_DATABASE: Record<string, { lat: number; lng: number; timezone: string; region: string; aliases: string[] }> = {
  "United States": { lat: 37.0902, lng: -95.7129, timezone: "EST / PST", region: "North America", aliases: ["usa", "us", "america", "united states of america"] },
  "Canada": { lat: 56.1304, lng: -106.3468, timezone: "EST / CST", region: "North America", aliases: ["ca"] },
  "United Kingdom": { lat: 55.3781, lng: -3.4360, timezone: "GMT / BST", region: "Europe", aliases: ["uk", "gb", "great britain", "england", "scotland", "wales", "london"] },
  "Germany": { lat: 51.1657, lng: 10.4515, timezone: "CET", region: "Europe", aliases: ["de", "deutschland", "berlin", "frankfurt", "munich"] },
  "France": { lat: 46.2276, lng: 2.2137, timezone: "CET", region: "Europe", aliases: ["fr", "paris"] },
  "Spain": { lat: 40.4637, lng: -3.7492, timezone: "CET", region: "Europe", aliases: ["es", "espana", "madrid", "barcelona"] },
  "Italy": { lat: 41.8719, lng: 12.5674, timezone: "CET", region: "Europe", aliases: ["it", "italia", "rome", "milan"] },
  "Netherlands": { lat: 52.1326, lng: 5.2913, timezone: "CET", region: "Europe", aliases: ["nl", "holland", "amsterdam"] },
  "Switzerland": { lat: 46.8182, lng: 8.2275, timezone: "CET", region: "Europe", aliases: ["ch", "zurich", "geneva"] },
  "Austria": { lat: 47.5162, lng: 14.5501, timezone: "CET", region: "Europe", aliases: ["at", "vienna"] },
  "Belgium": { lat: 50.5039, lng: 4.4699, timezone: "CET", region: "Europe", aliases: ["be", "brussels"] },
  "Sweden": { lat: 60.1282, lng: 18.6435, timezone: "CET", region: "Europe", aliases: ["se", "stockholm"] },
  "Norway": { lat: 60.4720, lng: 8.4689, timezone: "CET", region: "Europe", aliases: ["no", "oslo"] },
  "Denmark": { lat: 56.2639, lng: 9.5018, timezone: "CET", region: "Europe", aliases: ["dk", "copenhagen"] },
  "Finland": { lat: 61.9241, lng: 25.7482, timezone: "EET", region: "Europe", aliases: ["fi", "helsinki"] },
  "Ireland": { lat: 53.1424, lng: -7.6921, timezone: "GMT", region: "Europe", aliases: ["ie", "dublin"] },
  "Portugal": { lat: 39.3999, lng: -8.2245, timezone: "WET", region: "Europe", aliases: ["pt", "lisbon"] },
  "Poland": { lat: 51.9194, lng: 19.1451, timezone: "CET", region: "Europe", aliases: ["pl", "warsaw"] },
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478, timezone: "GST", region: "Middle East", aliases: ["uae", "dubai", "abu dhabi"] },
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792, timezone: "AST", region: "Middle East", aliases: ["ksa", "saudi", "riyadh", "jeddah"] },
  "Qatar": { lat: 25.3548, lng: 51.1839, timezone: "AST", region: "Middle East", aliases: ["qa", "doha"] },
  "Bahrain": { lat: 26.0667, lng: 50.5577, timezone: "AST", region: "Middle East", aliases: ["bh", "manama"] },
  "Kuwait": { lat: 29.3117, lng: 47.4818, timezone: "AST", region: "Middle East", aliases: ["kw", "kuwait city"] },
  "Oman": { lat: 21.4735, lng: 55.9754, timezone: "GST", region: "Middle East", aliases: ["om", "muscat"] },
  "Pakistan": { lat: 30.3753, lng: 69.3451, timezone: "PKT", region: "Asia", aliases: ["pk", "islamabad", "lahore", "karachi"] },
  "India": { lat: 20.5937, lng: 78.9629, timezone: "IST", region: "Asia", aliases: ["in", "mumbai", "delhi", "bangalore"] },
  "Singapore": { lat: 1.3521, lng: 103.8198, timezone: "SGT", region: "Asia", aliases: ["sg"] },
  "Australia": { lat: -25.2744, lng: 133.7751, timezone: "AEST / AWST", region: "Oceania", aliases: ["au", "sydney", "melbourne", "brisbane"] },
  "New Zealand": { lat: -40.9006, lng: 174.8860, timezone: "NZST", region: "Oceania", aliases: ["nz", "auckland", "wellington"] },
  "Japan": { lat: 36.2048, lng: 138.2529, timezone: "JST", region: "Asia", aliases: ["jp", "tokyo", "osaka"] },
  "South Korea": { lat: 35.9078, lng: 127.7669, timezone: "KST", region: "Asia", aliases: ["kr", "korea", "seoul"] },
  "China": { lat: 35.8617, lng: 104.1954, timezone: "CST", region: "Asia", aliases: ["cn", "beijing", "shanghai", "shenzhen"] },
  "Hong Kong": { lat: 22.3193, lng: 114.1694, timezone: "HKT", region: "Asia", aliases: ["hk"] },
  "Malaysia": { lat: 4.2105, lng: 101.9758, timezone: "MYT", region: "Asia", aliases: ["my", "kuala lumpur"] },
  "Indonesia": { lat: -0.7893, lng: 113.9213, timezone: "WIB", region: "Asia", aliases: ["id", "jakarta", "bali"] },
  "Thailand": { lat: 15.8700, lng: 100.9925, timezone: "ICT", region: "Asia", aliases: ["th", "bangkok"] },
  "Vietnam": { lat: 14.0583, lng: 108.2772, timezone: "ICT", region: "Asia", aliases: ["vn", "hanoi", "ho chi minh"] },
  "Philippines": { lat: 12.8797, lng: 121.7740, timezone: "PHT", region: "Asia", aliases: ["ph", "manila"] },
  "Brazil": { lat: -14.2350, lng: -51.9253, timezone: "BRT", region: "South America", aliases: ["br", "brasil", "sao paulo", "rio"] },
  "Argentina": { lat: -38.4161, lng: -63.6167, timezone: "ART", region: "South America", aliases: ["ar", "buenos aires"] },
  "Mexico": { lat: 23.6345, lng: -102.5528, timezone: "CST", region: "North America", aliases: ["mx", "mexico city"] },
  "Colombia": { lat: 4.5709, lng: -74.2973, timezone: "COT", region: "South America", aliases: ["co", "bogota"] },
  "Chile": { lat: -35.6751, lng: -71.5430, timezone: "CLT", region: "South America", aliases: ["cl", "santiago"] },
  "South Africa": { lat: -30.5595, lng: 22.9375, timezone: "SAST", region: "Africa", aliases: ["za", "cape town", "johannesburg"] },
  "Egypt": { lat: 26.8206, lng: 30.8025, timezone: "EET", region: "Africa", aliases: ["eg", "cairo"] },
  "Turkey": { lat: 38.9637, lng: 35.2433, timezone: "TRT", region: "Europe", aliases: ["tr", "turkiye", "istanbul", "ankara"] },
  "Greece": { lat: 39.0742, lng: 21.8243, timezone: "EET", region: "Europe", aliases: ["gr", "athens"] },
  "Czech Republic": { lat: 49.8175, lng: 15.4730, timezone: "CET", region: "Europe", aliases: ["cz", "czechia", "prague"] }
};

export const AVAILABLE_COUNTRIES = Object.keys(COUNTRIES_DATABASE).sort();

export function resolveCountryLocation(query: string): { name: string; x: string; y: string; timezone: string; region: string } {
  if (!query) {
    return { name: "United States", x: "23.41%", y: "29.39%", timezone: "EST / PST", region: "North America" };
  }

  const clean = query.trim().toLowerCase();

  // 1. Direct key match
  for (const [countryName, data] of Object.entries(COUNTRIES_DATABASE)) {
    if (countryName.toLowerCase() === clean) {
      const coords = latLngToCoords(data.lat, data.lng);
      return { name: countryName, x: coords.xPercent, y: coords.yPercent, timezone: data.timezone, region: data.region };
    }
  }

  // 2. Alias match
  for (const [countryName, data] of Object.entries(COUNTRIES_DATABASE)) {
    if (data.aliases.some(alias => alias === clean || clean.includes(alias) || alias.includes(clean))) {
      const coords = latLngToCoords(data.lat, data.lng);
      return { name: countryName, x: coords.xPercent, y: coords.yPercent, timezone: data.timezone, region: data.region };
    }
  }

  // 3. Partial substring match
  for (const [countryName, data] of Object.entries(COUNTRIES_DATABASE)) {
    if (countryName.toLowerCase().includes(clean) || clean.includes(countryName.toLowerCase())) {
      const coords = latLngToCoords(data.lat, data.lng);
      return { name: countryName, x: coords.xPercent, y: coords.yPercent, timezone: data.timezone, region: data.region };
    }
  }

  // Fallback default
  return {
    name: query,
    x: "50%",
    y: "50%",
    timezone: "UTC",
    region: "Global"
  };
}
