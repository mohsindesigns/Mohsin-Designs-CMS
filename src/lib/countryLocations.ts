// Comprehensive country, state, and city coordinates database mapped to Equirectangular projection (0-1000, 0-500)

export interface CountryLocation {
  name: string;
  code: string;
  lat: number;
  lng: number;
  x: number; // ViewBox x (0 to 1000)
  y: number; // ViewBox y (0 to 500)
  timezone: string;
  region: string;
  link?: string;
  focus?: string;
}

// Convert Latitude and Longitude to standard Equirectangular ViewBox percentage/points (1000x500)
export function latLngToCoords(lat: number, lng: number): { xPercent: string; yPercent: string; xPoint: number; yPoint: number } {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return {
    xPercent: `${((x / 1000) * 100).toFixed(2)}%`,
    yPercent: `${((y / 500) * 100).toFixed(2)}%`,
    xPoint: Math.round(x),
    yPoint: Math.round(y),
  };
}

export const COUNTRIES_DATABASE: Record<string, { lat: number; lng: number; timezone: string; region: string; aliases: string[] }> = {
  // ──────────────────────────────────────────────
  // ALL 50 US STATES & DISTRICTS
  // ──────────────────────────────────────────────
  "Alabama, USA": { lat: 32.8067, lng: -86.7911, timezone: "CST", region: "North America", aliases: ["alabama", "al", "birmingham", "montgomery"] },
  "Alaska, USA": { lat: 61.3707, lng: -152.4044, timezone: "AKST", region: "North America", aliases: ["alaska", "ak", "anchorage"] },
  "Arizona, USA": { lat: 33.7298, lng: -111.4312, timezone: "MST", region: "North America", aliases: ["arizona", "az", "phoenix", "tucson", "scottsdale"] },
  "Arkansas, USA": { lat: 34.9697, lng: -92.3731, timezone: "CST", region: "North America", aliases: ["arkansas", "ar", "little rock"] },
  "California, USA": { lat: 36.1162, lng: -119.6816, timezone: "PST", region: "North America", aliases: ["california", "ca", "los angeles", "san francisco", "san diego", "silicon valley", "sacramento"] },
  "Colorado, USA": { lat: 39.0598, lng: -105.3111, timezone: "MST", region: "North America", aliases: ["colorado", "co", "denver", "colorado springs", "boulder"] },
  "Connecticut, USA": { lat: 41.5978, lng: -72.7554, timezone: "EST", region: "North America", aliases: ["connecticut", "ct", "hartford", "stamford"] },
  "Delaware, USA": { lat: 39.3185, lng: -75.5071, timezone: "EST", region: "North America", aliases: ["delaware", "de", "wilmington", "dover"] },
  "Florida, USA": { lat: 27.7663, lng: -81.6868, timezone: "EST", region: "North America", aliases: ["florida", "fl", "miami", "orlando", "tampa", "jacksonville", "fort lauderdale"] },
  "Georgia, USA": { lat: 33.0406, lng: -83.6431, timezone: "EST", region: "North America", aliases: ["georgia usa", "ga", "atlanta", "savannah"] },
  "Hawaii, USA": { lat: 21.0943, lng: -157.4983, timezone: "HST", region: "North America", aliases: ["hawaii", "hi", "honolulu", "oahu", "maui"] },
  "Idaho, USA": { lat: 44.2405, lng: -114.4788, timezone: "MST", region: "North America", aliases: ["idaho", "id", "boise"] },
  "Illinois, USA": { lat: 40.3495, lng: -88.9861, timezone: "CST", region: "North America", aliases: ["illinois", "il", "chicago", "springfield"] },
  "Indiana, USA": { lat: 39.8494, lng: -86.2583, timezone: "EST", region: "North America", aliases: ["indiana", "in", "indianapolis"] },
  "Iowa, USA": { lat: 42.0115, lng: -93.2105, timezone: "CST", region: "North America", aliases: ["iowa", "ia", "des moines"] },
  "Kansas, USA": { lat: 38.5266, lng: -96.7265, timezone: "CST", region: "North America", aliases: ["kansas", "ks", "wichita", "kansas city"] },
  "Kentucky, USA": { lat: 37.6681, lng: -84.6701, timezone: "EST", region: "North America", aliases: ["kentucky", "ky", "louisville", "lexington"] },
  "Louisiana, USA": { lat: 31.1695, lng: -91.8678, timezone: "CST", region: "North America", aliases: ["louisiana", "la", "new orleans", "baton rouge"] },
  "Maine, USA": { lat: 44.6939, lng: -69.3819, timezone: "EST", region: "North America", aliases: ["maine", "me", "portland maine"] },
  "Maryland, USA": { lat: 39.0639, lng: -76.8021, timezone: "EST", region: "North America", aliases: ["maryland", "md", "baltimore", "annapolis"] },
  "Massachusetts, USA": { lat: 42.2302, lng: -71.5301, timezone: "EST", region: "North America", aliases: ["massachusetts", "ma", "boston", "cambridge"] },
  "Michigan, USA": { lat: 43.3266, lng: -84.5361, timezone: "EST", region: "North America", aliases: ["michigan", "mi", "detroit", "grand rapids"] },
  "Minnesota, USA": { lat: 45.6945, lng: -93.9002, timezone: "CST", region: "North America", aliases: ["minnesota", "mn", "minneapolis", "st paul"] },
  "Mississippi, USA": { lat: 32.7416, lng: -89.6787, timezone: "CST", region: "North America", aliases: ["mississippi", "ms", "jackson"] },
  "Missouri, USA": { lat: 38.4561, lng: -92.2884, timezone: "CST", region: "North America", aliases: ["missouri", "mo", "st louis", "saint louis", "kansas city mo"] },
  "Montana, USA": { lat: 46.9219, lng: -110.4544, timezone: "MST", region: "North America", aliases: ["montana", "mt", "helena", "billings"] },
  "Nebraska, USA": { lat: 41.1254, lng: -98.2681, timezone: "CST", region: "North America", aliases: ["nebraska", "ne", "omaha", "lincoln"] },
  "Nevada, USA": { lat: 38.3135, lng: -117.0554, timezone: "PST", region: "North America", aliases: ["nevada", "nv", "las vegas", "reno"] },
  "New Hampshire, USA": { lat: 43.4525, lng: -71.5639, timezone: "EST", region: "North America", aliases: ["new hampshire", "nh", "manchester"] },
  "New Jersey, USA": { lat: 40.2989, lng: -74.5210, timezone: "EST", region: "North America", aliases: ["new jersey", "nj", "newark", "jersey city", "princeton"] },
  "New Mexico, USA": { lat: 34.8405, lng: -106.2485, timezone: "MST", region: "North America", aliases: ["new mexico", "nm", "albuquerque", "santa fe"] },
  "New York, USA": { lat: 42.1657, lng: -74.9481, timezone: "EST", region: "North America", aliases: ["new york", "ny", "new york city", "nyc", "manhattan", "brooklyn"] },
  "North Carolina, USA": { lat: 35.6301, lng: -79.8064, timezone: "EST", region: "North America", aliases: ["north carolina", "nc", "charlotte", "raleigh", "durham"] },
  "North Dakota, USA": { lat: 47.5289, lng: -99.7840, timezone: "CST", region: "North America", aliases: ["north dakota", "nd", "fargo", "bismarck"] },
  "Ohio, USA": { lat: 40.3888, lng: -82.7649, timezone: "EST", region: "North America", aliases: ["ohio", "oh", "columbus", "cleveland", "cincinnati"] },
  "Oklahoma, USA": { lat: 35.5653, lng: -96.9289, timezone: "CST", region: "North America", aliases: ["oklahoma", "ok", "oklahoma city", "tulsa"] },
  "Oregon, USA": { lat: 44.5720, lng: -122.0709, timezone: "PST", region: "North America", aliases: ["oregon", "or", "portland", "salem", "eugene"] },
  "Pennsylvania, USA": { lat: 40.5908, lng: -77.2098, timezone: "EST", region: "North America", aliases: ["pennsylvania", "pa", "philadelphia", "pittsburgh"] },
  "Rhode Island, USA": { lat: 41.6809, lng: -71.5118, timezone: "EST", region: "North America", aliases: ["rhode island", "ri", "providence"] },
  "South Carolina, USA": { lat: 33.8569, lng: -80.9450, timezone: "EST", region: "North America", aliases: ["south carolina", "sc", "charleston", "columbia"] },
  "South Dakota, USA": { lat: 44.2998, lng: -99.4388, timezone: "CST", region: "North America", aliases: ["south dakota", "sd", "sioux falls", "pierre"] },
  "Tennessee, USA": { lat: 35.7478, lng: -86.6923, timezone: "CST", region: "North America", aliases: ["tennessee", "tn", "nashville", "memphis", "knoxville"] },
  "Texas, USA": { lat: 31.0545, lng: -97.5635, timezone: "CST", region: "North America", aliases: ["texas", "tx", "austin", "dallas", "houston", "san antonio", "fort worth"] },
  "Utah, USA": { lat: 40.1500, lng: -111.8624, timezone: "MST", region: "North America", aliases: ["utah", "ut", "salt lake city", "provo"] },
  "Vermont, USA": { lat: 44.0459, lng: -72.7107, timezone: "EST", region: "North America", aliases: ["vermont", "vt", "burlington", "montpelier"] },
  "Virginia, USA": { lat: 37.7693, lng: -78.1700, timezone: "EST", region: "North America", aliases: ["virginia", "va", "richmond", "virginia beach", "arlington", "tysons"] },
  "Washington, USA": { lat: 47.4009, lng: -121.4905, timezone: "PST", region: "North America", aliases: ["washington state", "wa", "seattle", "bellevue", "tacoma", "spokane"] },
  "Washington D.C., USA": { lat: 38.9072, lng: -77.0369, timezone: "EST", region: "North America", aliases: ["washington dc", "dc", "district of columbia"] },
  "West Virginia, USA": { lat: 38.4912, lng: -80.9545, timezone: "EST", region: "North America", aliases: ["west virginia", "wv", "charleston wv"] },
  "Wisconsin, USA": { lat: 44.2685, lng: -89.6165, timezone: "CST", region: "North America", aliases: ["wisconsin", "wi", "milwaukee", "madison"] },
  "Wyoming, USA": { lat: 42.7560, lng: -107.3025, timezone: "MST", region: "North America", aliases: ["wyoming", "wy", "cheyenne", "jackson hole"] },

  // ──────────────────────────────────────────────
  // CANADIAN PROVINCES
  // ──────────────────────────────────────────────
  "Ontario, Canada": { lat: 51.2538, lng: -85.3232, timezone: "EST", region: "North America", aliases: ["ontario", "on", "toronto", "ottawa"] },
  "Quebec, Canada": { lat: 52.9399, lng: -73.5491, timezone: "EST", region: "North America", aliases: ["quebec", "qc", "montreal", "quebec city"] },
  "British Columbia, Canada": { lat: 53.7267, lng: -127.6476, timezone: "PST", region: "North America", aliases: ["british columbia", "bc", "vancouver", "victoria bc"] },
  "Alberta, Canada": { lat: 53.9333, lng: -116.5765, timezone: "MST", region: "North America", aliases: ["alberta", "ab", "calgary", "edmonton"] },
  "Manitoba, Canada": { lat: 53.7609, lng: -98.8139, timezone: "CST", region: "North America", aliases: ["manitoba", "mb", "winnipeg"] },
  "Nova Scotia, Canada": { lat: 44.6820, lng: -63.7443, timezone: "AST", region: "North America", aliases: ["nova scotia", "ns", "halifax"] },

  // ──────────────────────────────────────────────
  // AUSTRALIAN STATES
  // ──────────────────────────────────────────────
  "New South Wales, Australia": { lat: -31.8402, lng: 145.6128, timezone: "AEST", region: "Oceania", aliases: ["nsw", "new south wales", "sydney"] },
  "Victoria, Australia": { lat: -37.4713, lng: 144.7852, timezone: "AEST", region: "Oceania", aliases: ["vic", "victoria australia", "melbourne"] },
  "Queensland, Australia": { lat: -20.9176, lng: 142.7028, timezone: "AEST", region: "Oceania", aliases: ["qld", "queensland", "brisbane", "gold coast"] },
  "Western Australia, Australia": { lat: -27.6728, lng: 121.6283, timezone: "AWST", region: "Oceania", aliases: ["wa australia", "western australia", "perth"] },
  "South Australia, Australia": { lat: -30.0002, lng: 136.2092, timezone: "ACST", region: "Oceania", aliases: ["sa australia", "south australia", "adelaide"] },
  "Tasmania, Australia": { lat: -41.4545, lng: 145.9707, timezone: "AEST", region: "Oceania", aliases: ["tasmania", "hobart"] },

  // ──────────────────────────────────────────────
  // WORLD COUNTRIES (GLOBAL COVERAGE)
  // ──────────────────────────────────────────────
  "United States": { lat: 37.0902, lng: -95.7129, timezone: "EST / PST", region: "North America", aliases: ["usa", "us", "america", "united states of america"] },
  "Canada": { lat: 56.1304, lng: -106.3468, timezone: "EST / CST", region: "North America", aliases: ["ca"] },
  "Mexico": { lat: 23.6345, lng: -102.5528, timezone: "CST", region: "North America", aliases: ["mx", "mexico city", "guadalajara", "monterrey"] },
  "United Kingdom": { lat: 55.3781, lng: -3.4360, timezone: "GMT / BST", region: "Europe", aliases: ["uk", "gb", "great britain", "england", "scotland", "wales", "london", "manchester"] },
  "Germany": { lat: 51.1657, lng: 10.4515, timezone: "CET", region: "Europe", aliases: ["de", "deutschland", "berlin", "frankfurt", "munich", "hamburg"] },
  "France": { lat: 46.2276, lng: 2.2137, timezone: "CET", region: "Europe", aliases: ["fr", "paris", "lyon", "marseille"] },
  "Spain": { lat: 40.4637, lng: -3.7492, timezone: "CET", region: "Europe", aliases: ["es", "espana", "madrid", "barcelona", "valencia"] },
  "Italy": { lat: 41.8719, lng: 12.5674, timezone: "CET", region: "Europe", aliases: ["it", "italia", "rome", "milan", "turin"] },
  "Netherlands": { lat: 52.1326, lng: 5.2913, timezone: "CET", region: "Europe", aliases: ["nl", "holland", "amsterdam", "rotterdam", "the hague"] },
  "Switzerland": { lat: 46.8182, lng: 8.2275, timezone: "CET", region: "Europe", aliases: ["ch", "zurich", "geneva", "basel", "bern"] },
  "Austria": { lat: 47.5162, lng: 14.5501, timezone: "CET", region: "Europe", aliases: ["at", "vienna", "salzburg"] },
  "Belgium": { lat: 50.5039, lng: 4.4699, timezone: "CET", region: "Europe", aliases: ["be", "brussels", "antwerp", "ghent"] },
  "Sweden": { lat: 60.1282, lng: 18.6435, timezone: "CET", region: "Europe", aliases: ["se", "stockholm", "gothenburg"] },
  "Norway": { lat: 60.4720, lng: 8.4689, timezone: "CET", region: "Europe", aliases: ["no", "oslo", "bergen"] },
  "Denmark": { lat: 56.2639, lng: 9.5018, timezone: "CET", region: "Europe", aliases: ["dk", "copenhagen", "aarhus"] },
  "Finland": { lat: 61.9241, lng: 25.7482, timezone: "EET", region: "Europe", aliases: ["fi", "helsinki", "espoo"] },
  "Ireland": { lat: 53.1424, lng: -7.6921, timezone: "GMT", region: "Europe", aliases: ["ie", "dublin", "cork", "galway"] },
  "Portugal": { lat: 39.3999, lng: -8.2245, timezone: "WET", region: "Europe", aliases: ["pt", "lisbon", "porto"] },
  "Poland": { lat: 51.9194, lng: 19.1451, timezone: "CET", region: "Europe", aliases: ["pl", "warsaw", "krakow", "wroclaw"] },
  "Czech Republic": { lat: 49.8175, lng: 15.4730, timezone: "CET", region: "Europe", aliases: ["cz", "czechia", "prague", "brno"] },
  "Greece": { lat: 39.0742, lng: 21.8243, timezone: "EET", region: "Europe", aliases: ["gr", "athens", "thessaloniki"] },
  "Turkey": { lat: 38.9637, lng: 35.2433, timezone: "TRT", region: "Europe", aliases: ["tr", "turkiye", "istanbul", "ankara", "izmir"] },
  "Romania": { lat: 45.9432, lng: 24.9668, timezone: "EET", region: "Europe", aliases: ["ro", "bucharest", "cluj"] },
  "Hungary": { lat: 47.1625, lng: 19.5033, timezone: "CET", region: "Europe", aliases: ["hu", "budapest"] },
  "Croatia": { lat: 45.1000, lng: 15.2000, timezone: "CET", region: "Europe", aliases: ["hr", "zagreb", "split", "dubrovnik"] },
  "Slovakia": { lat: 48.6690, lng: 19.6990, timezone: "CET", region: "Europe", aliases: ["sk", "bratislava"] },
  "Slovenia": { lat: 46.1512, lng: 14.9955, timezone: "CET", region: "Europe", aliases: ["si", "ljubljana"] },
  "Bulgaria": { lat: 42.7339, lng: 25.4858, timezone: "EET", region: "Europe", aliases: ["bg", "sofia"] },
  "Estonia": { lat: 58.5953, lng: 25.0136, timezone: "EET", region: "Europe", aliases: ["ee", "tallinn"] },
  "Latvia": { lat: 56.8796, lng: 24.6032, timezone: "EET", region: "Europe", aliases: ["lv", "riga"] },
  "Lithuania": { lat: 55.1694, lng: 23.8813, timezone: "EET", region: "Europe", aliases: ["lt", "vilnius"] },
  "Luxembourg": { lat: 49.8153, lng: 6.1296, timezone: "CET", region: "Europe", aliases: ["lu", "luxembourg city"] },
  "Iceland": { lat: 64.9631, lng: -19.0208, timezone: "GMT", region: "Europe", aliases: ["is", "reykjavik"] },
  "Cyprus": { lat: 35.1264, lng: 33.4299, timezone: "EET", region: "Europe", aliases: ["cy", "nicosia", "limassol"] },
  "Malta": { lat: 35.9375, lng: 14.3754, timezone: "CET", region: "Europe", aliases: ["mt", "valletta"] },
  "Ukraine": { lat: 48.3794, lng: 31.1656, timezone: "EET", region: "Europe", aliases: ["ua", "kyiv", "lviv"] },

  // Middle East & North Africa
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478, timezone: "GST", region: "Middle East", aliases: ["uae", "dubai", "abu dhabi", "sharjah"] },
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792, timezone: "AST", region: "Middle East", aliases: ["ksa", "saudi", "riyadh", "jeddah", "dammam"] },
  "Qatar": { lat: 25.3548, lng: 51.1839, timezone: "AST", region: "Middle East", aliases: ["qa", "doha"] },
  "Bahrain": { lat: 26.0667, lng: 50.5577, timezone: "AST", region: "Middle East", aliases: ["bh", "manama"] },
  "Kuwait": { lat: 29.3117, lng: 47.4818, timezone: "AST", region: "Middle East", aliases: ["kw", "kuwait city"] },
  "Oman": { lat: 21.4735, lng: 55.9754, timezone: "GST", region: "Middle East", aliases: ["om", "muscat"] },
  "Jordan": { lat: 30.5852, lng: 36.2384, timezone: "AST", region: "Middle East", aliases: ["jo", "amman"] },
  "Lebanon": { lat: 33.8547, lng: 35.8623, timezone: "EET", region: "Middle East", aliases: ["lb", "beirut"] },
  "Israel": { lat: 31.0461, lng: 34.8516, timezone: "IST", region: "Middle East", aliases: ["il", "tel aviv", "jerusalem"] },
  "Egypt": { lat: 26.8206, lng: 30.8025, timezone: "EET", region: "Africa", aliases: ["eg", "cairo", "alexandria"] },
  "Morocco": { lat: 31.7917, lng: -7.0926, timezone: "WET", region: "Africa", aliases: ["ma", "casablanca", "rabat", "marrakech"] },

  // Asia
  "Pakistan": { lat: 30.3753, lng: 69.3451, timezone: "PKT", region: "Asia", aliases: ["pk", "islamabad", "lahore", "karachi", "rawalpindi", "peshawar"] },
  "India": { lat: 20.5937, lng: 78.9629, timezone: "IST", region: "Asia", aliases: ["in", "mumbai", "delhi", "bangalore", "hyderabad", "chennai", "pune"] },
  "Singapore": { lat: 1.3521, lng: 103.8198, timezone: "SGT", region: "Asia", aliases: ["sg", "singapore city"] },
  "Japan": { lat: 36.2048, lng: 138.2529, timezone: "JST", region: "Asia", aliases: ["jp", "tokyo", "osaka", "kyoto", "yokohama"] },
  "South Korea": { lat: 35.9078, lng: 127.7669, timezone: "KST", region: "Asia", aliases: ["kr", "korea", "seoul", "busan", "incheon"] },
  "China": { lat: 35.8617, lng: 104.1954, timezone: "CST", region: "Asia", aliases: ["cn", "beijing", "shanghai", "shenzhen", "guangzhou", "hangzhou"] },
  "Hong Kong": { lat: 22.3193, lng: 114.1694, timezone: "HKT", region: "Asia", aliases: ["hk", "hong kong sar"] },
  "Taiwan": { lat: 23.6978, lng: 120.9605, timezone: "CST", region: "Asia", aliases: ["tw", "taipei", "kaohsiung"] },
  "Malaysia": { lat: 4.2105, lng: 101.9758, timezone: "MYT", region: "Asia", aliases: ["my", "kuala lumpur", "penang", "johor bahru"] },
  "Indonesia": { lat: -0.7893, lng: 113.9213, timezone: "WIB", region: "Asia", aliases: ["id", "jakarta", "bali", "surabaya"] },
  "Thailand": { lat: 15.8700, lng: 100.9925, timezone: "ICT", region: "Asia", aliases: ["th", "bangkok", "phuket", "chiang mai"] },
  "Vietnam": { lat: 14.0583, lng: 108.2772, timezone: "ICT", region: "Asia", aliases: ["vn", "hanoi", "ho chi minh", "da nang"] },
  "Philippines": { lat: 12.8797, lng: 121.7740, timezone: "PHT", region: "Asia", aliases: ["ph", "manila", "cebu", "quezon city"] },
  "Bangladesh": { lat: 23.6850, lng: 90.3563, timezone: "BST", region: "Asia", aliases: ["bd", "dhaka", "chittagong"] },
  "Sri Lanka": { lat: 7.8731, lng: 80.7718, timezone: "IST", region: "Asia", aliases: ["lk", "colombo"] },
  "Nepal": { lat: 28.3949, lng: 84.1240, timezone: "NPT", region: "Asia", aliases: ["np", "kathmandu"] },

  // Oceania
  "Australia": { lat: -25.2744, lng: 133.7751, timezone: "AEST / AWST", region: "Oceania", aliases: ["au", "sydney", "melbourne", "brisbane", "perth", "adelaide"] },
  "New Zealand": { lat: -40.9006, lng: 174.8860, timezone: "NZST", region: "Oceania", aliases: ["nz", "auckland", "wellington", "christchurch"] },
  "Fiji": { lat: -17.7134, lng: 178.0650, timezone: "FJT", region: "Oceania", aliases: ["fj", "suva"] },

  // South & Central America
  "Brazil": { lat: -14.2350, lng: -51.9253, timezone: "BRT", region: "South America", aliases: ["br", "brasil", "sao paulo", "rio de janeiro", "brasilia"] },
  "Argentina": { lat: -38.4161, lng: -63.6167, timezone: "ART", region: "South America", aliases: ["ar", "buenos aires", "cordoba"] },
  "Colombia": { lat: 4.5709, lng: -74.2973, timezone: "COT", region: "South America", aliases: ["co", "bogota", "medellin", "cali"] },
  "Chile": { lat: -35.6751, lng: -71.5430, timezone: "CLT", region: "South America", aliases: ["cl", "santiago", "valparaiso"] },
  "Peru": { lat: -9.1900, lng: -75.0152, timezone: "PET", region: "South America", aliases: ["pe", "lima", "cusco"] },
  "Ecuador": { lat: -1.8312, lng: -78.1834, timezone: "ECT", region: "South America", aliases: ["ec", "quito", "guayaquil"] },
  "Uruguay": { lat: -32.5228, lng: -55.7658, timezone: "UYT", region: "South America", aliases: ["uy", "montevideo"] },
  "Costa Rica": { lat: 9.7489, lng: -83.7534, timezone: "CST", region: "Central America", aliases: ["cr", "san jose"] },
  "Panama": { lat: 8.5379, lng: -80.7821, timezone: "EST", region: "Central America", aliases: ["pa", "panama city"] },
  "Puerto Rico": { lat: 18.2208, lng: -66.5901, timezone: "AST", region: "Caribbean", aliases: ["pr", "san juan"] },

  // Africa
  "South Africa": { lat: -30.5595, lng: 22.9375, timezone: "SAST", region: "Africa", aliases: ["za", "cape town", "johannesburg", "durban"] },
  "Nigeria": { lat: 9.0820, lng: 8.6753, timezone: "WAT", region: "Africa", aliases: ["ng", "lagos", "abuja"] },
  "Kenya": { lat: -0.0236, lng: 37.9062, timezone: "EAT", region: "Africa", aliases: ["ke", "nairobi", "mombasa"] },
  "Ghana": { lat: 7.9465, lng: -1.0232, timezone: "GMT", region: "Africa", aliases: ["gh", "accra"] },
  "Ethiopia": { lat: 9.1450, lng: 40.4897, timezone: "EAT", region: "Africa", aliases: ["et", "addis ababa"] },
  "Tanzania": { lat: -6.3690, lng: 34.8888, timezone: "EAT", region: "Africa", aliases: ["tz", "dar es salaam"] },
  "Uganda": { lat: 1.3733, lng: 32.2903, timezone: "EAT", region: "Africa", aliases: ["ug", "kampala"] },
  "Rwanda": { lat: -1.9403, lng: 29.8739, timezone: "CAT", region: "Africa", aliases: ["rw", "kigali"] }
};

export const AVAILABLE_LOCATIONS = Object.keys(COUNTRIES_DATABASE).sort();
export const AVAILABLE_COUNTRIES = AVAILABLE_LOCATIONS; // backward compatibility

export function resolveCountryLocation(query: string): { name: string; x: string; y: string; timezone: string; region: string; lat: number; lng: number } {
  if (!query) {
    return { name: "United States", x: "23.41%", y: "29.39%", timezone: "EST / PST", region: "North America", lat: 37.0902, lng: -95.7129 };
  }

  const clean = query.trim().toLowerCase();

  // 1. Direct key match
  for (const [locName, data] of Object.entries(COUNTRIES_DATABASE)) {
    if (locName.toLowerCase() === clean) {
      const coords = latLngToCoords(data.lat, data.lng);
      return { name: locName, x: coords.xPercent, y: coords.yPercent, timezone: data.timezone, region: data.region, lat: data.lat, lng: data.lng };
    }
  }

  // 2. Alias match
  for (const [locName, data] of Object.entries(COUNTRIES_DATABASE)) {
    if (data.aliases.some(alias => alias === clean || clean === alias || clean.startsWith(alias + " ") || clean.endsWith(" " + alias))) {
      const coords = latLngToCoords(data.lat, data.lng);
      return { name: locName, x: coords.xPercent, y: coords.yPercent, timezone: data.timezone, region: data.region, lat: data.lat, lng: data.lng };
    }
  }

  // 3. Partial substring match
  for (const [locName, data] of Object.entries(COUNTRIES_DATABASE)) {
    if (locName.toLowerCase().includes(clean) || clean.includes(locName.toLowerCase())) {
      const coords = latLngToCoords(data.lat, data.lng);
      return { name: locName, x: coords.xPercent, y: coords.yPercent, timezone: data.timezone, region: data.region, lat: data.lat, lng: data.lng };
    }
  }

  // Fallback default
  return {
    name: query,
    x: "50%",
    y: "50%",
    timezone: "UTC",
    region: "Global",
    lat: 20,
    lng: 0
  };
}
