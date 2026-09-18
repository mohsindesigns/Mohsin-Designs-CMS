const mongoose = require("mongoose");
const path = require("path");

// Load production .env.local on the server
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || "mdseo2025";
    console.log("Connecting to:", dbName);
    await mongoose.connect(uri, { dbName });
    const db = mongoose.connection.db;

    const totalPages = await db.collection("pages").countDocuments();
    const byTemplate = await db.collection("pages").aggregate([
      { $group: { _id: "$template", count: { $sum: 1 } } }
    ]).toArray();

    console.log("Total Pages:", totalPages);
    console.log("Pages by template:", JSON.stringify(byTemplate, null, 2));

    // Inspect location/country/state/city pages specifically
    const locations = await db.collection("pages").find({
      template: { $in: ["country", "state", "city", "location", "locations"] }
    }, {
      projection: {
        _id: 1,
        title: 1,
        slug: 1,
        template: 1,
        status: 1,
        "seo.canonicalUrl": 1,
        "content.country": 1,
        "content.countrySlug": 1,
        "content.state": 1,
        "content.stateSlug": 1,
        "content.city": 1,
        "content.citySlug": 1,
        "content.parentLocationId": 1,
        "content.parentLocationSlug": 1
      }
    }).toArray();

    const countries = await db.collection("pages").find({ template: "country" }, {
      projection: { _id: 1, title: 1, slug: 1, "seo.canonicalUrl": 1, content: 1 }
    }).toArray();

    const states = await db.collection("pages").find({ template: "state" }, {
      projection: { _id: 1, title: 1, slug: 1, "seo.canonicalUrl": 1, "content.country": 1, "content.countrySlug": 1, "content.parentLocationId": 1 }
    }).toArray();

    const cities = await db.collection("pages").find({ template: "city" }, {
      projection: { _id: 1, title: 1, slug: 1, status: 1, "seo.canonicalUrl": 1, "content.country": 1, "content.countrySlug": 1, "content.state": 1, "content.stateSlug": 1, "content.parentLocationId": 1 }
    }).toArray();

    console.log("\n=== COUNTRIES (" + countries.length + ") ===");
    console.log(JSON.stringify(countries, null, 2));

    console.log("\n=== STATES (" + states.length + ") ===");
    console.log(JSON.stringify(states.map(s => ({
      _id: s._id,
      title: s.title,
      slug: s.slug,
      canonical: s.seo?.canonicalUrl,
      country: s.content?.country || s.content?.countrySlug
    })), null, 2));

    console.log("\n=== CITIES (" + cities.length + ") ===");
    console.log(JSON.stringify(cities.map(c => ({
      _id: c._id,
      title: c.title,
      slug: c.slug,
      status: c.status,
      canonical: c.seo?.canonicalUrl,
      stateInContent: c.content?.state || c.content?.stateSlug,
      countryInContent: c.content?.country || c.content?.countrySlug
    })), null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error inspecting prod:", err);
    process.exit(1);
  }
}

run();
