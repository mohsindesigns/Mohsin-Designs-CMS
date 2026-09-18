const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync(path.join(__dirname, "prod_locations_dump.json"), "utf8");

const countriesIdx = raw.indexOf("=== COUNTRIES (3) ===");
const statesIdx = raw.indexOf("=== STATES (");
const citiesIdx = raw.indexOf("=== CITIES (");

const countriesStr = raw.substring(countriesIdx + "=== COUNTRIES (3) ===".length, statesIdx).trim();
const statesStr = raw.substring(statesIdx + raw.substring(statesIdx).indexOf("\n"), citiesIdx).trim();
const citiesStr = raw.substring(citiesIdx + raw.substring(citiesIdx).indexOf("\n")).trim();

const countries = JSON.parse(countriesStr);
const states = JSON.parse(statesStr);
const cities = JSON.parse(citiesStr);

console.log("TOTAL COUNTRIES:", countries.length);
console.log("TOTAL STATES:", states.length);
console.log("TOTAL CITIES:", cities.length);

// Known state-to-country mapping
const stateToCountry = {
  // US States
  "alabama": "usa", "alaska": "usa", "arizona": "usa", "arkansas": "usa", "california": "usa",
  "colorado": "usa", "connecticut": "usa", "delaware": "usa", "florida": "usa", "georgia": "usa",
  "hawaii": "usa", "idaho": "usa", "illinois": "usa", "indiana": "usa", "iowa": "usa",
  "kansas": "usa", "kentucky": "usa", "louisiana": "usa", "maine": "usa", "maryland": "usa",
  "massachusetts": "usa", "michigan": "usa", "minnesota": "usa", "mississippi": "usa", "missouri": "usa",
  "montana": "usa", "nebraska": "usa", "nevada": "usa", "new-hampshire": "usa", "new-jersey": "usa",
  "new-mexico": "usa", "new-york": "usa", "north-carolina": "usa", "north-dakota": "usa", "ohio": "usa",
  "oklahoma": "usa", "oregon": "usa", "pennsylvania": "usa", "rhode-island": "usa", "south-carolina": "usa",
  "south-dakota": "usa", "tennessee": "usa", "texas": "usa", "utah": "usa", "vermont": "usa",
  "virginia": "usa", "washington": "usa", "west-virginia": "usa", "wisconsin": "usa", "wyoming": "usa",
  // Australia
  "nsw": "australia", "new-south-wales": "australia", "victoria": "australia", "queensland": "australia",
  "western-australia": "australia", "south-australia": "australia", "tasmania": "australia",
  // New Zealand
  "north-island": "new-zealand", "south-island": "new-zealand"
};

// Known US Cities to state mapping if canonical is ambiguous
const cityToStateFallback = {
  "mustang": { state: "oklahoma", country: "usa" }, // in Oklahoma
  "northland": { state: "north-island", country: "new-zealand" }, // Northland is region in NZ
  "charlotte": { state: "north-carolina", country: "usa" },
  "raleigh": { state: "north-carolina", country: "usa" },
  "asheville": { state: "north-carolina", country: "usa" },
  "durham": { state: "north-carolina", country: "usa" },
  "greensboro": { state: "north-carolina", country: "usa" },
  "mount-pleasant": { state: "south-carolina", country: "usa" },
  "rock-hill": { state: "south-carolina", country: "usa" },
  "athens": { state: "georgia", country: "usa" },
  "atlanta": { state: "georgia", country: "usa" },
  "savannah": { state: "georgia", country: "usa" },
  "roswell": { state: "georgia", country: "usa" },
  "columbus": { state: "georgia", country: "usa" },
  "jacksonville": { state: "florida", country: "usa" },
  // Ohio cities that were marked template: "state"
  "toledo": { state: "ohio", country: "usa" },
  "cleveland": { state: "ohio", country: "usa" },
  "dayton": { state: "ohio", country: "usa" },
  "cincinnati": { state: "ohio", country: "usa" },
  "hamilton": { state: "ohio", country: "usa" },
};

console.log("\n=== AUDITING ALL CITIES ===");
const resolvedCities = [];
const unresolvedCities = [];

cities.forEach(c => {
  let country = null;
  let state = null;
  let citySlug = c.slug;

  // 1. Try canonical URL first
  if (c.canonical) {
    try {
      const u = new URL(c.canonical);
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length === 3) {
        country = parts[0];
        state = parts[1];
        citySlug = parts[2];
      } else if (parts.length === 2) {
        state = parts[0];
        citySlug = parts[1];
        if (stateToCountry[state]) {
          country = stateToCountry[state];
        }
      }
    } catch (e) {}
  }

  // 2. Try content fields
  if (!state && c.stateInContent) {
    state = c.stateInContent.toLowerCase().trim().replace(/\s+/g, "-");
  }
  if (!country && c.countryInContent) {
    country = c.countryInContent.toLowerCase().trim().replace(/\s+/g, "-");
  }

  // 3. Try fallback city mapping
  const baseSlug = c.slug.replace(/-copy-\d+$/, "");
  if (!state && cityToStateFallback[baseSlug]) {
    state = cityToStateFallback[baseSlug].state;
    country = cityToStateFallback[baseSlug].country;
  }
  if (state && !country && stateToCountry[state]) {
    country = stateToCountry[state];
  }

  // Check if copy
  const isCopy = c.slug.includes("-copy-");
  const canonicalCitySlug = isCopy ? c.slug : (citySlug || baseSlug);

  const newSlug = country && state ? `${country}/${state}/${canonicalCitySlug}` : null;
  const newCanonical = newSlug ? `https://mohsindesigns.com/${newSlug}/` : null;

  const item = {
    _id: c._id,
    title: c.title,
    oldSlug: c.slug,
    status: c.status,
    country,
    state,
    canonicalCitySlug,
    newSlug,
    newCanonical,
    oldCanonical: c.canonical
  };

  if (country && state) {
    resolvedCities.push(item);
  } else {
    unresolvedCities.push(item);
  }
});

console.log(`Resolved: ${resolvedCities.length} / ${cities.length}`);
console.log(`Unresolved: ${unresolvedCities.length} / ${cities.length}`);

if (unresolvedCities.length > 0) {
  console.log("\nUNRESOLVED CITIES:");
  console.log(JSON.stringify(unresolvedCities, null, 2));
}

console.log("\nSAMPLE 15 RESOLVED CITIES:");
console.log(JSON.stringify(resolvedCities.slice(0, 15), null, 2));
