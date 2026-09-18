const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync(path.join(__dirname, "prod_locations_dump.json"), "utf8");

// Extract the sections
const countriesIdx = raw.indexOf("=== COUNTRIES (3) ===");
const statesIdx = raw.indexOf("=== STATES (");
const citiesIdx = raw.indexOf("=== CITIES (");

const countriesStr = raw.substring(countriesIdx + "=== COUNTRIES (3) ===".length, statesIdx).trim();
const statesStr = raw.substring(statesIdx + raw.substring(statesIdx).indexOf("\n"), citiesIdx).trim();
const citiesStr = raw.substring(citiesIdx + raw.substring(citiesIdx).indexOf("\n")).trim();

const countries = JSON.parse(countriesStr);
const states = JSON.parse(statesStr);
const cities = JSON.parse(citiesStr);

console.log("=== COUNTRIES (" + countries.length + ") ===");
countries.forEach(c => {
  console.log(`- [${c._id}] slug: "${c.slug}" | title: "${c.title}" | canonical: "${c.seo?.canonicalUrl}"`);
});

console.log("\n=== STATES (" + states.length + ") ===");
states.forEach(s => {
  console.log(`- [${s._id}] slug: "${s.slug}" | title: "${s.title}" | canonical: "${s.canonical}" | country: "${s.country}"`);
});

console.log("\n=== CITIES (" + cities.length + ") ===");
let matched = 0;
let needsParent = 0;
cities.forEach(c => {
  // Let's see if we can resolve country and state from canonical or content
  let detectedCountry = c.countryInContent || null;
  let detectedState = c.stateInContent || null;
  let detectedCity = null;

  if (c.canonical) {
    try {
      const u = new URL(c.canonical);
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length === 3) {
        detectedCountry = parts[0];
        detectedState = parts[1];
        detectedCity = parts[2];
      } else if (parts.length === 2) {
        detectedState = parts[0];
        detectedCity = parts[1];
      }
    } catch (e) {}
  }

  console.log(`- [${c._id}] "${c.title}" (slug: "${c.slug}", status: "${c.status}") => canonical: "${c.canonical}" => detected: [${detectedCountry} / ${detectedState} / ${detectedCity}]`);
  if (detectedCountry && detectedState) matched++;
  else needsParent++;
});

console.log(`\nMatched: ${matched} / ${cities.length} cities. Needs parent resolution: ${needsParent}`);
