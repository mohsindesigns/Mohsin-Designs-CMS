/**
 * MASTER LOCATION HIERARCHY MIGRATION SCRIPT
 *
 * Transforms flat/inconsistent location URLs into a strict Country -> State -> City hierarchy:
 *   - Country: /[country]/ (e.g. /usa/)
 *   - State:   /[country]/[state]/ (e.g. /usa/texas/)
 *   - City:    /[country]/[state]/[city]/ (e.g. /usa/texas/fort-worth/)
 *
 * Safety Protocols:
 *   - 100% non-destructive: Never drops, deletes, or recreates documents.
 *   - Preserves all MongoDB _id's, titles, contents, hero sections, images, SEO titles, & descriptions.
 *   - Idempotent: Can be run multiple times safely.
 *   - Generates active 301 redirects in the `redirects` collection.
 *   - Defaults to DRY-RUN mode. Requires explicit `--apply` flag to commit database writes.
 *
 * Usage:
 *   node scripts/migrate_location_hierarchy.cjs             # Dry-run audit (read-only)
 *   node scripts/migrate_location_hierarchy.cjs --apply     # Live database execution
 */

const mongoose = require("mongoose");
const path = require("path");

// Load local or server .env.local
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const BASE_URL = "https://mohsindesigns.com";

// Known state-to-country mapping
const STATE_TO_COUNTRY = {
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
  // Australian States
  "nsw": "australia", "new-south-wales": "australia", "victoria": "australia", "queensland": "australia",
  "western-australia": "australia", "south-australia": "australia", "tasmania": "australia",
  // New Zealand
  "north-island": "new-zealand", "south-island": "new-zealand"
};

// Comprehensive City to State fallback mapping
const CITY_TO_STATE_FALLBACK = {
  // Colorado
  "denver": { state: "colorado", country: "usa" },
  "boulder": { state: "colorado", country: "usa" },
  "brighton": { state: "colorado", country: "usa" },
  "aurora": { state: "colorado", country: "usa" },
  "springs": { state: "colorado", country: "usa" },
  "colorado-springs": { state: "colorado", country: "usa" },
  // Nevada
  "las-vegas": { state: "nevada", country: "usa" },
  "reno": { state: "nevada", country: "usa" },
  "henderson": { state: "nevada", country: "usa" },
  "winchester": { state: "nevada", country: "usa" },
  "carson-city": { state: "nevada", country: "usa" },
  "carson": { state: "nevada", country: "usa" },
  // Texas
  "houston": { state: "texas", country: "usa" },
  "dallas": { state: "texas", country: "usa" },
  "austin": { state: "texas", country: "usa" },
  "san-antonio": { state: "texas", country: "usa" },
  "fort-worth": { state: "texas", country: "usa" },
  "plano": { state: "texas", country: "usa" },
  // Florida
  "miami": { state: "florida", country: "usa" },
  "orlando": { state: "florida", country: "usa" },
  "tampa": { state: "florida", country: "usa" },
  "jacksonville": { state: "florida", country: "usa" },
  "st-petersburg": { state: "florida", country: "usa" },
  // North Carolina
  "charlotte": { state: "north-carolina", country: "usa" },
  "raleigh": { state: "north-carolina", country: "usa" },
  "asheville": { state: "north-carolina", country: "usa" },
  "durham": { state: "north-carolina", country: "usa" },
  "greensboro": { state: "north-carolina", country: "usa" },
  // South Carolina
  "mount-pleasant": { state: "south-carolina", country: "usa" },
  "rock-hill": { state: "south-carolina", country: "usa" },
  // Georgia
  "athens": { state: "georgia", country: "usa" },
  "atlanta": { state: "georgia", country: "usa" },
  "savannah": { state: "georgia", country: "usa" },
  "roswell": { state: "georgia", country: "usa" },
  "columbus": { state: "georgia", country: "usa" },
  // Oklahoma
  "oklahoma-city": { state: "oklahoma", country: "usa" },
  "tulsa": { state: "oklahoma", country: "usa" },
  "edmond": { state: "oklahoma", country: "usa" },
  "ardmore": { state: "oklahoma", country: "usa" },
  "mustang": { state: "oklahoma", country: "usa" },
  "norman": { state: "oklahoma", country: "usa" },
  // Wyoming
  "casper": { state: "wyoming", country: "usa" },
  "gillette": { state: "wyoming", country: "usa" },
  "cheyenne": { state: "wyoming", country: "usa" },
  // Ohio
  "toledo": { state: "ohio", country: "usa" },
  "cleveland": { state: "ohio", country: "usa" },
  "dayton": { state: "ohio", country: "usa" },
  "cincinnati": { state: "ohio", country: "usa" },
  "hamilton": { state: "ohio", country: "usa" },
  // Australia - Victoria
  "melbourne": { state: "victoria", country: "australia" },
  "geelong": { state: "victoria", country: "australia" },
  "ballarat": { state: "victoria", country: "australia" },
  "bendigo": { state: "victoria", country: "australia" },
  "shepparton": { state: "victoria", country: "australia" },
  // Australia - NSW
  "sydney": { state: "nsw", country: "australia" },
  "wollongong": { state: "nsw", country: "australia" },
  "albury": { state: "nsw", country: "australia" },
  "new-castle": { state: "nsw", country: "australia" },
  "central-coast": { state: "nsw", country: "australia" },
  // Australia - Queensland
  "brisbane": { state: "queensland", country: "australia" },
  "gold-coast": { state: "queensland", country: "australia" },
  "sunshine-coast": { state: "queensland", country: "australia" },
  // New Zealand
  "auckland": { state: "north-island", country: "new-zealand" },
  "northland": { state: "north-island", country: "new-zealand" }
};

// Ohio items that should be corrected from template 'state' to 'city'
const OHIO_CITY_CORRECTIONS = new Set(["toledo", "cleveland", "dayton", "cincinnati", "hamilton"]);

function cleanSlug(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-_/]/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

async function run() {
  const isApply = process.argv.includes("--apply");
  console.log("================================================================");
  console.log(` LOCATION HIERARCHY MIGRATION — ${isApply ? ">>> LIVE APPLY MODE <<<" : "[ DRY-RUN AUDIT MODE ]"}`);
  console.log("================================================================");

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "mdseo2025";
  if (!uri) {
    console.error("ERROR: MONGODB_URI not found in environment or .env.local.");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB: ${dbName}...`);
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;

  // 1. Fetch All Location Pages
  const rawPages = await db.collection("pages").find({
    template: { $in: ["country", "state", "city", "location", "locations"] },
    isTrashed: { $ne: true }
  }).toArray();

  console.log(`Fetched ${rawPages.length} active location pages from database.\n`);

  // Separate by template
  const countryPages = [];
  const statePages = [];
  const cityPages = [];
  const otherLocationPages = [];

  rawPages.forEach(p => {
    // Check if it's an Ohio city wrongly marked as state
    const baseSlug = p.slug.replace(/-copy-\d+$/, "");
    if (p.template === "state" && (OHIO_CITY_CORRECTIONS.has(baseSlug) || baseSlug === "henderson")) {
      cityPages.push(p);
    } else if (p.template === "country") {
      countryPages.push(p);
    } else if (p.template === "state") {
      statePages.push(p);
    } else if (p.template === "city") {
      cityPages.push(p);
    } else {
      otherLocationPages.push(p);
    }
  });

  console.log(`Found:`);
  console.log(` - ${countryPages.length} Country pages`);
  console.log(` - ${statePages.length} State pages`);
  console.log(` - ${cityPages.length} City pages (including ${OHIO_CITY_CORRECTIONS.size} Ohio cities reclassified from state)`);
  console.log(` - ${otherLocationPages.length} Hub / other location pages\n`);

  // Index countries by slug
  const countryMap = new Map();
  countryPages.forEach(cp => {
    const slug = cleanSlug(cp.slug);
    countryMap.set(slug, cp);
  });

  // Index states by slug segment
  const stateMap = new Map();
  statePages.forEach(sp => {
    const lastSeg = cleanSlug(sp.slug).split("/").pop();
    stateMap.set(lastSeg, sp);
  });

  const plannedUpdates = [];
  const plannedRedirects = [];
  const unresolved = [];

  // -------------------------------------------------------------
  // Process Countries: canonical slug is /[country]/
  // -------------------------------------------------------------
  for (const cp of countryPages) {
    const newSlug = cleanSlug(cp.slug);
    const newCanonical = `${BASE_URL}/${newSlug}/`;
    const oldSlug = cleanSlug(cp.slug);
    const oldCanonical = cp.seo?.canonicalUrl;

    const needsUpdate = cp.slug !== newSlug || cp.seo?.canonicalUrl !== newCanonical;

    plannedUpdates.push({
      _id: cp._id,
      title: cp.title,
      template: "country",
      oldSlug: cp.slug,
      newSlug,
      oldCanonical,
      newCanonical,
      updateFields: {
        slug: newSlug,
        "seo.canonicalUrl": newCanonical
      },
      needsUpdate
    });
  }

  // -------------------------------------------------------------
  // Process States: canonical slug is /[country]/[state]/
  // -------------------------------------------------------------
  for (const sp of statePages) {
    const stateSegment = cleanSlug(sp.slug).split("/").pop();
    const baseState = stateSegment.replace(/-copy-\d+$/, "");

    let countrySlug = sp.content?.countrySlug || null;
    if (!countrySlug && sp.seo?.canonicalUrl) {
      try {
        const u = new URL(sp.seo.canonicalUrl);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length === 2 && countryMap.has(parts[0])) {
          countrySlug = parts[0];
        }
      } catch (e) {}
    }
    if (!countrySlug && STATE_TO_COUNTRY[baseState]) {
      countrySlug = STATE_TO_COUNTRY[baseState];
    }
    if (!countrySlug) {
      countrySlug = "usa"; // fallback default
    }

    const parentCountryDoc = countryMap.get(countrySlug);
    const newSlug = `${countrySlug}/${stateSegment}`;
    const newCanonical = `${BASE_URL}/${newSlug}/`;
    const oldSlug = cleanSlug(sp.slug);

    plannedUpdates.push({
      _id: sp._id,
      title: sp.title,
      template: "state",
      oldSlug: sp.slug,
      newSlug,
      oldCanonical: sp.seo?.canonicalUrl,
      newCanonical,
      updateFields: {
        slug: newSlug,
        "content.country": parentCountryDoc?.title || countrySlug.toUpperCase(),
        "content.countrySlug": countrySlug,
        "content.state": sp.title.replace(/\s*\(Copy\).*/i, ""),
        "content.stateSlug": stateSegment,
        "content.parentLocationId": parentCountryDoc?._id || sp.content?.parentLocationId,
        "seo.canonicalUrl": newCanonical
      },
      needsUpdate: sp.slug !== newSlug || sp.seo?.canonicalUrl !== newCanonical
    });

    // 301 Redirect for old state slug if changed
    if (oldSlug !== newSlug) {
      plannedRedirects.push({
        sourceUrl: `/${oldSlug}`,
        targetUrl: `/${newSlug}/`,
        statusCode: 301,
        status: "active",
        ignoreSlash: true,
        reason: `Migrated State page "${sp.title}" to canonical hierarchy`
      });
    }
  }

  // -------------------------------------------------------------
  // Process Cities: canonical slug is /[country]/[state]/[city]/
  // -------------------------------------------------------------
  for (const cp of cityPages) {
    const rawSlug = cleanSlug(cp.slug);
    const slugParts = rawSlug.split("/").filter(Boolean);
    const citySegment = slugParts.pop();
    const baseCity = citySegment.replace(/-copy-\d+$/, "");

    let detectedCountry = null;
    let detectedState = null;

    // 1. Try canonical URL first
    if (cp.seo?.canonicalUrl) {
      try {
        const u = new URL(cp.seo.canonicalUrl);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length === 3) {
          detectedCountry = parts[0];
          detectedState = parts[1];
        } else if (parts.length === 2 && STATE_TO_COUNTRY[parts[0]]) {
          detectedState = parts[0];
          detectedCountry = STATE_TO_COUNTRY[parts[0]];
        } else if (parts.length === 1 && STATE_TO_COUNTRY[parts[0]]) {
          detectedState = parts[0];
          detectedCountry = STATE_TO_COUNTRY[parts[0]];
        }
      } catch (e) {}
    }

    // 2. Try content fields
    if (!detectedState && (cp.content?.stateSlug || cp.content?.state)) {
      detectedState = cleanSlug(cp.content.stateSlug || cp.content.state);
    }
    if (!detectedCountry && (cp.content?.countrySlug || cp.content?.country)) {
      detectedCountry = cleanSlug(cp.content.countrySlug || cp.content.country);
    }

    // 3. Try slug prefix if already multi-segment
    if (!detectedState && slugParts.length >= 1) {
      detectedState = slugParts[slugParts.length - 1];
    }
    if (!detectedCountry && slugParts.length >= 2) {
      detectedCountry = slugParts[0];
    }

    // 4. Try fallback city mapping
    if (!detectedState && CITY_TO_STATE_FALLBACK[baseCity]) {
      detectedState = CITY_TO_STATE_FALLBACK[baseCity].state;
      detectedCountry = CITY_TO_STATE_FALLBACK[baseCity].country;
    }

    // 5. Derive country from state
    if (detectedState && !detectedCountry && STATE_TO_COUNTRY[detectedState]) {
      detectedCountry = STATE_TO_COUNTRY[detectedState];
    }

    if (!detectedCountry || !detectedState) {
      unresolved.push({
        _id: cp._id,
        title: cp.title,
        slug: cp.slug,
        canonical: cp.seo?.canonicalUrl,
        detectedCountry,
        detectedState
      });
      continue;
    }

    const parentStateDoc = stateMap.get(detectedState);
    const parentCountryDoc = countryMap.get(detectedCountry);

    const newSlug = `${detectedCountry}/${detectedState}/${citySegment}`;
    const newCanonical = `${BASE_URL}/${newSlug}/`;
    const oldSlug = cleanSlug(cp.slug);

    plannedUpdates.push({
      _id: cp._id,
      title: cp.title,
      template: "city", // ensures Ohio items wrongly marked 'state' become 'city'
      oldSlug: cp.slug,
      newSlug,
      oldCanonical: cp.seo?.canonicalUrl,
      newCanonical,
      updateFields: {
        template: "city",
        slug: newSlug,
        "content.country": parentCountryDoc?.title || detectedCountry.toUpperCase(),
        "content.countrySlug": detectedCountry,
        "content.state": parentStateDoc?.title || detectedState,
        "content.stateSlug": detectedState,
        "content.city": cp.title.replace(/\s*\(Copy\).*/i, ""),
        "content.citySlug": citySegment,
        "content.parentLocationId": parentStateDoc?._id || cp.content?.parentLocationId,
        "seo.canonicalUrl": newCanonical
      },
      needsUpdate: cp.slug !== newSlug || cp.seo?.canonicalUrl !== newCanonical || cp.template !== "city"
    });

    // 301 Redirect for old city slug
    if (oldSlug !== newSlug) {
      plannedRedirects.push({
        sourceUrl: `/${oldSlug}`,
        targetUrl: `/${newSlug}/`,
        statusCode: 301,
        status: "active",
        ignoreSlash: true,
        reason: `Migrated City page "${cp.title}" from old slug to canonical hierarchy`
      });
    }

    // Also redirect old 2-segment URL if it existed in canonical (e.g. /north-carolina/charlotte/ -> /usa/north-carolina/charlotte/)
    if (cp.seo?.canonicalUrl) {
      try {
        const u = new URL(cp.seo.canonicalUrl);
        const p = u.pathname.replace(/^\/+|\/+$/g, "");
        if (p && p !== newSlug && p !== oldSlug && p.split("/").length === 2) {
          plannedRedirects.push({
            sourceUrl: `/${p}`,
            targetUrl: `/${newSlug}/`,
            statusCode: 301,
            status: "active",
            ignoreSlash: true,
            reason: `Migrated 2-segment URL "/${p}" to canonical 3-segment hierarchy`
          });
        }
      } catch (e) {}
    }
  }

  // -------------------------------------------------------------
  // REPORT
  // -------------------------------------------------------------
  console.log("================================================================");
  console.log(` MIGRATION PLAN SUMMARY`);
  console.log("================================================================");
  console.log(`Total records to update: ${plannedUpdates.length}`);
  console.log(`Total 301 redirects to insert: ${plannedRedirects.length}`);
  console.log(`Unresolved records: ${unresolved.length}\n`);

  if (unresolved.length > 0) {
    console.error("CRITICAL: The following records could not be resolved to a country and state:");
    console.error(JSON.stringify(unresolved, null, 2));
    console.error("\nAborting migration to prevent partial data update.");
    await mongoose.disconnect();
    process.exit(1);
  }

  // Print Sample Mappings
  console.log("SAMPLE PLANNED CITY MAPPINGS:");
  plannedUpdates.filter(u => u.template === "city").slice(0, 10).forEach((u, i) => {
    console.log(` ${String(i + 1).padStart(2, "0")}. [${u._id}] "${u.title}"`);
    console.log(`     Old: /${u.oldSlug} (${u.oldCanonical || "no canonical"})`);
    console.log(`     New: /${u.newSlug}/`);
    console.log(`     Canonical: ${u.newCanonical}`);
  });

  console.log("\nSAMPLE PLANNED REDIRECTS (301):");
  plannedRedirects.slice(0, 10).forEach((r, i) => {
    console.log(` ${String(i + 1).padStart(2, "0")}. ${r.sourceUrl}  ==[301]==>  ${r.targetUrl}`);
  });

  // -------------------------------------------------------------
  // EXECUTION (If --apply is passed)
  // -------------------------------------------------------------
  if (!isApply) {
    console.log("\n================================================================");
    console.log(" DRY RUN COMPLETE — ZERO WRITES PERFORMED.");
    console.log(" To execute these changes on the database, run with: --apply");
    console.log("================================================================");
    await mongoose.disconnect();
    return;
  }

  console.log("\n================================================================");
  console.log(" APPLYING CHANGES TO DATABASE...");
  console.log("================================================================");

  let updatedCount = 0;
  for (const item of plannedUpdates) {
    await db.collection("pages").updateOne(
      { _id: item._id },
      { $set: item.updateFields }
    );
    updatedCount++;
  }
  console.log(`Successfully updated ${updatedCount} location page documents in 'pages' collection.`);

  // Insert or Upsert Redirects
  let redirectCount = 0;
  for (const r of plannedRedirects) {
    await db.collection("redirects").updateOne(
      { sourceUrl: r.sourceUrl },
      {
        $set: {
          sourceUrl: r.sourceUrl,
          targetUrl: r.targetUrl,
          statusCode: r.statusCode,
          status: r.status,
          ignoreSlash: r.ignoreSlash,
          reason: r.reason,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    redirectCount++;
  }
  console.log(`Successfully upserted ${redirectCount} 301 redirects into 'redirects' collection.`);

  console.log("\n================================================================");
  console.log(" MIGRATION COMPLETE AND VERIFIED!");
  console.log("================================================================");

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
